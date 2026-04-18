export const metadata = {
  title: "Debt Planner",
  description: "Track and eliminate your debt",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
