import "./globals.css";

export const metadata = {
  title: "DM Trigger Bot — Turn comments into conversations",
  description:
    "Automatically DM anyone who comments your trigger word. Set it up in two minutes, no code required.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
