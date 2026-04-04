import numpy as np
import cv2
import insightface
from insightface.app import FaceAnalysis
import tempfile
import requests
from io import BytesIO

class ModelManager:
    """
    Loads InsightFace FaceAnalysis (antelope) and exposes embedding helpers.
    This class uses CPU by default. To enable GPU, install the appropriate
    insightface+mxnet/cuda wheels and ensure MXNet sees GPU.
    """

    def __init__(self):
        # Load antelopev2 / arcface model
        # FaceAnalysis will download model weights automatically to ~/.insightface
        self.app = FaceAnalysis(name="buffalo_s", allowed_modules=['detection', 'recognition'])
        self.app.prepare(ctx_id=0 if self._has_gpu() else -1)
        # ctx_id=-1 uses CPU

    def _has_gpu(self):
        # basic: check if MXNet GPU available; if not, assume CPU
        try:
            import mxnet as mx
            return mx.context.num_gpus() > 0
        except Exception:
            return False

    def _read_bytes(self, bts):
        arr = np.frombuffer(bts, np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return img

    def _bbox_area(self, face):
        area = getattr(face, 'bbox_area', None)
        if area is not None:
            try:
                return float(area)
            except (TypeError, ValueError):
                pass

        bbox = getattr(face, 'bbox', None)
        if bbox is not None and len(bbox) == 4:
            try:
                x1, y1, x2, y2 = [float(v) for v in bbox]
                return max(0.0, x2 - x1) * max(0.0, y2 - y1)
            except (TypeError, ValueError):
                return 0.0
        return 0.0

    def embed_bytes(self, bts):
        img = self._read_bytes(bts)
        if img is None:
            raise ValueError("Invalid image")
        faces = self.app.get(img) or []
        if not faces:
            return []

        valid_faces = [f for f in faces if getattr(f, 'embedding', None) is not None]
        if not valid_faces:
            return []

        sorted_faces = sorted(valid_faces, key=self._bbox_area, reverse=True)
        return [np.array(f.embedding, dtype=float) for f in sorted_faces]

    def embed_url(self, url):
        r = requests.get(url, timeout=20)
        return self.embed_bytes(r.content)
