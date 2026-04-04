FROM python:3.10

WORKDIR /app

# Install system dependencies (VERY IMPORTANT)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements
COPY requirements.txt .

# Install dependencies (FIX)
RUN pip install --no-cache-dir numpy==1.23.5
RUN pip install --no-cache-dir insightface==0.7.3
RUN pip install --no-cache-dir onnxruntime
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY app/ app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]