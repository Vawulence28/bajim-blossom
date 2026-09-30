import "./globals.css";

export const metadata = {
  title: "Bajim Blossom Kitchen & Household Items",
  description:
    "Bajim Blossom Kitchen & Household Items — a community-based thrift contribution initiative for useful kitchen and household items.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}