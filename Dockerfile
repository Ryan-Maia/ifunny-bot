FROM ubuntu:20.04

# Define o frontend do Debian como não interativo e define o timezone
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC

# Atualiza os pacotes e instala dependências necessárias
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    build-essential \
    fonts-liberation \
    libappindicator1 \
    libgbm-dev \
    libxshmfence1 \
    libnss3 \
    xdg-utils \
    wget \
    tzdata

# Baixa e instala diretamente o Node.js versão 20.17.0
RUN curl -fsSL https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.17.0-1nodesource1_amd64.deb -o nodejs_20.17.0.deb
RUN dpkg -i nodejs_20.17.0.deb || apt-get install -f -y

# Instala o Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' && \
    apt-get update && apt-get install -y google-chrome-stable


# Instala pacotes adicionais
RUN apt-get update && apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    fonts-liberation \
    lsb-release

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Cria pastas
RUN mkdir -p config public src

# Copia os arquivos necessários
COPY package.json ./ 
COPY package-lock.json ./

# Instala as dependências do Node.js
RUN npm install --unsafe-perm

# Verifica os módulos instalados
RUN ls node_modules

# Copia os arquivos restantes
COPY config ./config
COPY public ./public
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Compila o TypeScript
RUN npm run compile

# Expõe a porta 3030
EXPOSE 3030

# Comando padrão para iniciar o Node.js
CMD ["node", "lib"]
