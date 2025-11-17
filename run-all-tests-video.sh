#!/bin/bash

echo "🎬 Rodando todos os testes E2E e gravando vídeos..."

# Limpa vídeos antigos
rm -rf test-results/
rm -f all-tests-combined.mp4

# Roda todos os testes em headed mode
npx playwright test --headed

# Verifica se há vídeos
if [ ! -d "test-results" ]; then
    echo "❌ Nenhum vídeo encontrado. Testes não foram executados."
    exit 1
fi

# Encontra todos os vídeos .webm
videos=$(find test-results -name "*.webm" | sort)

if [ -z "$videos" ]; then
    echo "❌ Nenhum vídeo .webm encontrado."
    exit 1
fi

echo "📹 Vídeos encontrados:"
echo "$videos"

# Cria um arquivo de lista para o ffmpeg
echo "📝 Criando lista de vídeos..."
rm -f video-list.txt
for video in $videos; do
    echo "file '$video'" >> video-list.txt
done

# Verifica se ffmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  ffmpeg não está instalado. Instalando via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install ffmpeg
    else
        echo "❌ Homebrew não encontrado. Instale o ffmpeg manualmente:"
        echo "   brew install ffmpeg"
        exit 1
    fi
fi

# Junta todos os vídeos em um só
echo "🎞️  Juntando vídeos..."
ffmpeg -f concat -safe 0 -i video-list.txt -c copy all-tests-combined.webm -y

# Converte para MP4 (opcional, melhor compatibilidade)
echo "🔄 Convertendo para MP4..."
ffmpeg -i all-tests-combined.webm -c:v libx264 -preset fast -crf 22 all-tests-combined.mp4 -y

# Limpa arquivo temporário
rm -f video-list.txt all-tests-combined.webm

echo "✅ Vídeo combinado salvo em: all-tests-combined.mp4"
echo "📊 Tamanho: $(du -h all-tests-combined.mp4 | cut -f1)"
