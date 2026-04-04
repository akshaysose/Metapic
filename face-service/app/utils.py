# small helpers (not used heavily)
def cosine(a,b):
    import numpy as np
    a = np.asarray(a)
    b = np.asarray(b)
    if a.size==0 or b.size==0: return 0.0
    na = (a*a).sum()**0.5
    nb = (b*b).sum()**0.5
    return float((a*b).sum()/(na*nb))
