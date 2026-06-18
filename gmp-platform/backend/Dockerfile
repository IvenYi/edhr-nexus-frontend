FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/*.jar app.jar
COPY scripts ./scripts
COPY requirements-ocr.txt ./requirements-ocr.txt

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip libgomp1 libglib2.0-0 libgl1 \
    && python3 -m pip install --no-cache-dir --break-system-packages -r requirements-ocr.txt \
    && mkdir -p /app/uploads \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
