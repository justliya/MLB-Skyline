# Use the official Python image.
FROM python:3.12

# Set the working directory.
WORKDIR /app

# Copy requirements and install dependencies.
RUN apt-get update && apt-get install -y gcc

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code.
COPY . .

# Expose port and run the application.
ENV PORT 8080
CMD ["python", "replay.py"]
