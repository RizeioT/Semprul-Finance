import React from "react";

export default function FooterView() {
  return (
    <footer
      className="w-full border-t-4 border-black bg-white mt-16"
      id="brutalist-app-footer"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2">
          <div className="font-extrabold text-2xl tracking-tighter text-black uppercase italic">
            SempruL Finance
          </div>
          <p className="font-mono text-xs text-neutral-500">
            © 2026 SempruL Finance. All records maintained locally. Zero
            tracking bloat.
          </p>
        </div>
        <div className="flex gap-6 flex-wrap justify-center font-mono text-xs uppercase font-bold text-neutral-500">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert(
                "Kebijakan Privasi: Semua data finansial Anda disimpan secara aman di localStorage browser Anda.",
              );
            }}
            className="hover:text-black transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert(
                "Ketentuan Penggunaan: Platform SempruL Finance dirancang untuk simulasi, pelacakan mandiri, dan eksplorasi visual personal.",
              );
            }}
            className="hover:text-black transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="https://www.instagram.com/rzkyesa_/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ABF600] transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/in/rizky-esa-firmansyah-186347352/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ABF600] transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
