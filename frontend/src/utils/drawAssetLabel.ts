import JsBarcode from "jsbarcode";

const LABEL_W = 400;
const LABEL_H = 240;

export async function drawAssetLabel(canvas: HTMLCanvasElement, assetId: number) {
  canvas.width = LABEL_W;
  canvas.height = LABEL_H;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, LABEL_W, LABEL_H);

  const logoHeight = 60;
  const rowMiddle = 66;
  const textLabel = "BinaryHeart";
  ctx.font = "bold 22px sans-serif";

  await new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const logoWidth = Math.round((image.naturalWidth / image.naturalHeight) * logoHeight);
      const textWidth = ctx.measureText(textLabel).width;
      const gap = 8;
      const startX = Math.round((LABEL_W - logoWidth - gap - textWidth) / 2);
      ctx.filter = "grayscale(1)";
      ctx.drawImage(image, startX, rowMiddle - logoHeight / 2, logoWidth, logoHeight);
      ctx.filter = "none";
      ctx.fillStyle = "black";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(textLabel, startX + logoWidth + gap, rowMiddle);
      ctx.textBaseline = "alphabetic";
      resolve();
    };
    image.onerror = () => {
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(textLabel, LABEL_W / 2, 60);
      resolve();
    };
    image.src = "/icon.png";
  });

  const barcode = document.createElement("canvas");
  JsBarcode(barcode, String(assetId).padStart(6, "0"), {
    format: "CODE128",
    width: 3,
    height: 100,
    displayValue: true,
    fontSize: 16,
    margin: 0,
    textMargin: 4,
  });

  const barcodeX = Math.round((LABEL_W - barcode.width) / 2);
  ctx.drawImage(barcode, barcodeX, 112);
}
