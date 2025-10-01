export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-10 py-6">
      <div className="container mx-auto text-center text-sm text-gray-600">
        © {new Date().getFullYear()} goEUgo Clone. All rights reserved.
      </div>
    </footer>
  );
}
