using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

// Layered soft-pink peony bloom generator (dense painter's algorithm over Bezier petals).
public static class PeonyGen
{
    private static double Hash(int i, int j)
    {
        int n = i * 374761393 + j * 668265263;
        n = (n ^ (n >> 13)) * 1274126177;
        n = n ^ (n >> 16);
        return ((n & 0x7fffffff) % 10000) / 10000.0;
    }

    private static byte ClampByte(double v)
    {
        if (v < 0) return 0;
        if (v > 255) return 255;
        return (byte)v;
    }

    private static Color Shade(int[] c, double f)
    {
        return Color.FromArgb(255, ClampByte(c[0] * f), ClampByte(c[1] * f), ClampByte(c[2] * f));
    }

    // Petal outline in local coordinates: +X points outward from the flower centre.
    private static GraphicsPath PetalPath(double baseLen, double tipLen, double halfWidth, double notch)
    {
        GraphicsPath path = new GraphicsPath();
        PointF p0 = new PointF((float)(-baseLen), 0f);
        PointF p1 = new PointF((float)(tipLen * 0.90), (float)(halfWidth * 0.22));
        PointF p2 = new PointF((float)(tipLen * (1.0 - notch)), 0f);
        PointF p3 = new PointF((float)(tipLen * 0.90), (float)(-halfWidth * 0.22));

        path.AddBezier(p0,
            new PointF((float)(-baseLen * 0.05), (float)(halfWidth * 0.74)),
            new PointF((float)(tipLen * 0.60), (float)(halfWidth * 0.84)),
            p1);
        path.AddBezier(p1,
            new PointF((float)(tipLen * 0.99), (float)(halfWidth * 0.09)),
            new PointF((float)(tipLen * (1.0 - notch * 0.20)), (float)(halfWidth * 0.05)),
            p2);
        path.AddBezier(p2,
            new PointF((float)(tipLen * (1.0 - notch * 1.80)), 0f),
            new PointF((float)(tipLen * 0.99), (float)(-halfWidth * 0.09)),
            p3);
        path.AddBezier(p3,
            new PointF((float)(tipLen * 0.60), (float)(-halfWidth * 0.84)),
            new PointF((float)(-baseLen * 0.05), (float)(-halfWidth * 0.74)),
            p0);
        path.CloseFigure();
        return path;
    }

    private static Matrix PetalMatrix(double cx, double cy, double angleDeg, double distance, double scaleX, double scaleY, double offsetY)
    {
        Matrix m = new Matrix();
        m.Translate((float)cx, (float)cy);
        m.Rotate((float)angleDeg);
        if (scaleX != 1.0 || scaleY != 1.0) m.Scale((float)scaleX, (float)scaleY);
        m.Translate((float)distance, (float)offsetY);
        return m;
    }
private static readonly int[] RingCounts = new int[] { 36, 32, 28, 24, 20, 17, 14, 11, 8 };
    private static readonly double[] RingRadius = new double[] { 0.865, 0.780, 0.695, 0.605, 0.515, 0.425, 0.335, 0.240, 0.145 };
    private static readonly double[] RingLen = new double[] { 0.155, 0.150, 0.145, 0.139, 0.132, 0.124, 0.114, 0.100, 0.082 };
    private static readonly double[] RingWidth = new double[] { 0.118, 0.113, 0.108, 0.103, 0.096, 0.089, 0.081, 0.071, 0.058 };
    private static readonly double[] RingPhase = new double[] { 0.00, 0.47, 0.21, 0.68, 0.34, 0.79, 0.13, 0.56, 0.28 };

    private static readonly int[][] TipColors = new int[][] {
        new int[] { 252, 234, 233 }, new int[] { 251, 230, 230 }, new int[] { 250, 225, 227 },
        new int[] { 248, 219, 223 }, new int[] { 246, 212, 218 }, new int[] { 244, 204, 212 },
        new int[] { 241, 196, 206 }, new int[] { 236, 186, 198 }, new int[] { 228, 172, 187 }
    };
    private static readonly int[][] BaseColors = new int[][] {
        new int[] { 237, 196, 199 }, new int[] { 235, 191, 196 }, new int[] { 232, 184, 191 },
        new int[] { 229, 176, 186 }, new int[] { 225, 168, 180 }, new int[] { 220, 159, 174 },
        new int[] { 214, 150, 167 }, new int[] { 207, 140, 159 }, new int[] { 197, 128, 150 }
    };

    public static void Render(string path, int size)
    {
        double cx = size * 0.5;
        double cy = size * 0.5;
        double maxR = size * 0.455;
        double discR = maxR * 0.95;

        Bitmap bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(bmp))
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.Clear(Color.Transparent);

            // ── backing disc so gaps between petals read as deeper petals, not background ──
            RectangleF discRect = new RectangleF((float)(cx - discR), (float)(cy - discR), (float)(discR * 2), (float)(discR * 2));
            using (GraphicsPath disc = new GraphicsPath())
            {
                disc.AddEllipse(discRect);
                using (PathGradientBrush dg = new PathGradientBrush(disc))
                {
                    dg.CenterPoint = new PointF((float)(cx - discR * 0.10), (float)(cy - discR * 0.12));
                    dg.CenterColor = Color.FromArgb(255, 248, 227, 229);
                    dg.SurroundColors = new Color[] { Color.FromArgb(255, 243, 212, 216) };
                    g.FillPath(dg, disc);
                }
            }
for (int ring = 0; ring < RingCounts.Length; ring++)
            {
                int count = RingCounts[ring];
                double step = 360.0 / count;
                for (int j = 0; j < count; j++)
                {
                    double jitterR = (Hash(ring, j) - 0.5) * 0.045;
                    double jitterA = (Hash(ring + 40, j) - 0.5) * 7.0;
                    double jitterL = 1.0 + (Hash(ring + 80, j) - 0.5) * 0.14;
                    double jitterW = 1.0 + (Hash(ring + 120, j) - 0.5) * 0.12;
                    double angle = j * step + RingPhase[ring] * step + jitterA;
                    double distance = maxR * (RingRadius[ring] + jitterR);
                    double halfLen = maxR * RingLen[ring] * jitterL;
                    double halfWidth = maxR * RingWidth[ring] * jitterW;
                    double baseLen = halfLen * 0.92;

                    double rad = angle * Math.PI / 180.0;
                    double lightF = 1.0 + 0.045 * (-Math.Cos(rad) * 0.62 - Math.Sin(rad) * 0.5);

                    if (ring > 0)
                    {
                        GraphicsPath shadow = PetalPath(baseLen, halfLen, halfWidth, 0.10);
                        using (Matrix sm = PetalMatrix(cx, cy, angle + 1.4, distance, 1.02, 1.035, maxR * 0.009))
                        {
                            shadow.Transform(sm);
                        }
                        using (SolidBrush sb = new SolidBrush(Color.FromArgb(16, 150, 96, 110)))
                        {
                            g.FillPath(sb, shadow);
                        }
                        shadow.Dispose();
                    }

                    GraphicsPath petal = PetalPath(baseLen, halfLen, halfWidth, 0.10);
                    using (Matrix m = PetalMatrix(cx, cy, angle, distance, 1.0, 1.0, 0.0))
                    {
                        petal.Transform(m);
                    }

                    PointF tipPoint = new PointF(
                        (float)(cx + Math.Cos(rad) * (distance + halfLen * 1.02)),
                        (float)(cy + Math.Sin(rad) * (distance + halfLen * 1.02)));
                    PointF basePoint = new PointF(
                        (float)(cx + Math.Cos(rad) * (distance - baseLen)),
                        (float)(cy + Math.Sin(rad) * (distance - baseLen)));

                    Color cTip = Shade(TipColors[ring], lightF);
                    Color cBase = Shade(BaseColors[ring], lightF * 0.985);
                    Color cMid = Shade(TipColors[ring], lightF * 0.960);

                    using (LinearGradientBrush lb = new LinearGradientBrush(basePoint, tipPoint, cBase, cTip))
                    {
                        ColorBlend blend = new ColorBlend(3);
                        blend.Colors = new Color[] { cBase, cMid, cTip };
                        blend.Positions = new float[] { 0f, 0.5f, 1f };
                        lb.InterpolationColors = blend;
                        g.FillPath(lb, petal);
                    }

                    using (Pen rim = new Pen(Color.FromArgb(34, 255, 253, 251), Math.Max(1.0f, (float)(maxR * 0.0030))))
                    {
                        g.DrawPath(rim, petal);
                    }

                    petal.Dispose();
                }
            }
// ── ruffled centre cluster ──
            for (int j = 0; j < 9; j++)
            {
                double angle = j * (360.0 / 9) + 14.0;
                GraphicsPath core = PetalPath(maxR * 0.030, maxR * 0.056, maxR * 0.034, 0.08);
                using (Matrix m = PetalMatrix(cx, cy, angle, maxR * 0.070, 1.0, 1.0, 0.0))
                {
                    core.Transform(m);
                }
                using (SolidBrush cb = new SolidBrush(Color.FromArgb(255, 205, 140, 156)))
                {
                    g.FillPath(cb, core);
                }
                core.Dispose();
            }
            using (SolidBrush dark = new SolidBrush(Color.FromArgb(230, 158, 104, 119)))
            {
                g.FillEllipse(dark, (float)(cx - maxR * 0.030), (float)(cy - maxR * 0.030), (float)(maxR * 0.060), (float)(maxR * 0.060));
            }
            using (SolidBrush darker = new SolidBrush(Color.FromArgb(215, 116, 74, 88)))
            {
                g.FillEllipse(darker, (float)(cx - maxR * 0.012), (float)(cy - maxR * 0.010), (float)(maxR * 0.024), (float)(maxR * 0.020));
            }
        }
Bitmap composed = new Bitmap(size, size, PixelFormat.Format32bppArgb);
        using (Graphics g2 = Graphics.FromImage(composed))
        {
            g2.SmoothingMode = SmoothingMode.AntiAlias;
            g2.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g2.PixelOffsetMode = PixelOffsetMode.HighQuality;
            float grow = 1.004f;
            float offset = (size - size * grow) / 2f;
            g2.DrawImage(bmp, offset, offset, size * grow, size * grow);
        }
        bmp.Dispose();

        BitmapData data = composed.LockBits(new Rectangle(0, 0, size, size), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int stride = data.Stride;
        byte[] buffer = new byte[stride * size];
        System.Runtime.InteropServices.Marshal.Copy(data.Scan0, buffer, 0, buffer.Length);

        double featherStart = maxR * 1.005;
        double featherEnd = maxR * 1.045;

        for (int y = 0; y < size; y++)
        {
            for (int x = 0; x < size; x++)
            {
                int o = y * stride + x * 4;
                double dx = x + 0.5 - cx;
                double dy = (y + 0.5 - cy) / 1.06;
                double r = Math.Sqrt(dx * dx + dy * dy);
                int alpha = buffer[o + 3];

                if (alpha > 0 && r > featherStart)
                {
                    double k = 1.0 - (r - featherStart) / (featherEnd - featherStart);
                    if (k < 0) k = 0;
                    if (k > 1) k = 1;
                    alpha = (int)(alpha * k);
                    buffer[o + 3] = (byte)alpha;
                }

                if (alpha > 0)
                {
                    int grain = (int)((Hash(x, y) - 0.5) * 3.0);
                    int bb = buffer[o] + grain;
                    int gg = buffer[o + 1] + grain;
                    int rr = buffer[o + 2] + grain;
                    buffer[o] = ClampByte(bb);
                    buffer[o + 1] = ClampByte(gg);
                    buffer[o + 2] = ClampByte(rr);
                }
            }
        }

        System.Runtime.InteropServices.Marshal.Copy(buffer, 0, data.Scan0, buffer.Length);
        composed.UnlockBits(data);
        composed.Save(path, ImageFormat.Png);
        composed.Dispose();
    }
}
