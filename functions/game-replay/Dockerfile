# Use the official Python image.
FROM python:3.12-slim

# Set the working directory.
WORKDIR /app

# Copy requirements and install dependencies.
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code.
COPY . .

# Expose port and run the application.
ENV PORT 8080
CMD ["python", "replay.py"]
