#!/bin/bash
cd "$(dirname "$0")"

NODE=""
for p in \
  "/opt/homebrew/bin/node" \
  "/usr/local/bin/node" \
  "$HOME/.nvm/versions/node/"*/bin/node \
  "/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node"
do
  if [ -x "$p" ] 2>/dev/null; then
    NODE="$p"
    break
  fi
done

if [ -z "$NODE" ]; then
  echo ""
  echo "  ❌ Chưa tìm thấy Node.js trên máy bạn."
  echo ""
  echo "  Cài Node.js tại: https://nodejs.org (bấm Download LTS)"
  echo "  Sau khi cài xong, chạy lại file start.command này."
  echo ""
  read -p "Nhấn Enter để đóng..."
  exit 1
fi

echo ""
echo "  🛵 Đang khởi động Yadea Tân Bình..."
echo "  📋 Admin: http://localhost:3000/admin/"
echo "  🔑 Đăng nhập: admin / admin"
echo ""
echo "  (Giữ cửa sổ này mở — đóng = tắt website)"
echo ""

sleep 1
open "http://localhost:3000/admin/" 2>/dev/null || true

"$NODE" server.js
