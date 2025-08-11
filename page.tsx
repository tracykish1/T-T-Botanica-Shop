// 'use client' for interactive cart; split client islands inside
import Image from "next/image";
import { Suspense } from "react";
import { BRAND } from "@/config/shopConfig";
import { Shop } from "@/components/Shop";

export default function Page() {
  return (
    <div>
      <Announcement />
      <Nav />
      <Hero />
      <Suspense fallback={<div className="container py-12">Loading shop…</div>}>
        <Shop />
      </Suspense>
      <Footer />
    </div>
  );
}

function Announcement() {
  return (
    <div className="w-full bg-brand-700 text-white text-sm py-2">
      <div className="container flex items-center justify-between">
        <div>🌿 Welcome to {BRAND.name}! $5 off $50 with code <b>FERN5</b>.</div>
        <div className="hidden sm:block">{BRAND.tagline}</div>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky-nav">
      <div className="container py-3 flex items-center gap-3">
        <Image src="/logo.svg" alt="T&T Botanica" width={120} height={36} priority />
        <div className="ml-auto flex items-center gap-4">
          <a className="link" href={BRAND.social.facebook} target="_blank">Facebook</a>
          <a className="link" href={BRAND.social.instagram} target="_blank">Instagram</a>
          <a className="btn" href="#shop">Shop</a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="container py-12 grid lg:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome to {BRAND.name}</h1>
        <p className="mt-3 text-gray-700 leading-relaxed">
          A young nursery with big dreams—crafting an immersive, whimsical plant experience that blends tropical jungle with enchanted forest.
        </p>
        <div className="mt-5 flex gap-3">
          <a href="#shop" className="btn btn-primary">Shop featured</a>
          <a href="mailto:hello@ttbotanica.com" className="btn">Local pickup info</a>
        </div>
      </div>
      <div className="shadow-soft">
        <Image className="hero-img" src="https://images.unsplash.com/photo-1598899134739-24b6b8443a86?q=80&w=1600&auto=format&fit=crop" alt="Lush plants" width={1200} height={600} />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>© {new Date().getFullYear()} {BRAND.name} • Tacoma, WA</div>
        <div className="flex items-center gap-3">
          <a className="link" href="#shipping">Shipping & returns</a>
          <span>•</span>
          <a className="link" href="#care">Care guides</a>
          <span>•</span>
          <a className="link" href="#privacy">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
