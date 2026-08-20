import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  UtensilsCrossed,
  Clock,
  Truck,
  ShieldCheck,
  Star,
  ArrowRight,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold text-primary">
              DapurPOS
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#menu" className="text-sm font-medium hover:text-primary transition-colors">
              Menu
            </a>
            <a href="#cara-pesan" className="text-sm font-medium hover:text-primary transition-colors">
              Cara Pesan
            </a>
            <a href="#tentang" className="text-sm font-medium hover:text-primary transition-colors">
              Tentang
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Daftar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6">
            Nasi Kotak <span className="text-primary">Premium</span>
            <br />
            Untuk Setiap Acara
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Pesan nasi kotak dengan menu custom sesuai selera. Cocok untuk
            arisan, meeting, acara keluarga, dan berbagai momen spesial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button size="lg" className="w-full sm:w-auto">
                Pesan Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#cara-pesan">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Cara Pesan
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <UtensilsCrossed className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Menu Custom</h3>
                <p className="text-sm text-muted-foreground">
                  Pilih nasi, protein, dan lauk sesuai selera Anda
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Jadwal Fleksibel</h3>
                <p className="text-sm text-muted-foreground">
                  Pilih tanggal dan waktu pengiriman sesuai kebutuhan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Delivery & Pickup</h3>
                <p className="text-sm text-muted-foreground">
                  Gratis ongkir radius 3km, atau ambil sendiri
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Kualitas Terjamin</h3>
                <p className="text-sm text-muted-foreground">
                  Bahan segar, dimasak hari H, dan higienis
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section id="menu" className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Pilihan Menu
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Berbagai pilihan nasi, protein, dan lauk pelengkap untuk
              kombinasi sempurna
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Rice Options */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-heading text-lg font-semibold mb-4 text-primary">
                  Pilihan Nasi
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span>Nasi Putih</span>
                    <span className="font-medium">Rp 5.000</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Nasi Kuning</span>
                    <span className="font-medium">Rp 7.000</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Nasi Uduk</span>
                    <span className="font-medium">Rp 6.000</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Protein Options */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-heading text-lg font-semibold mb-4 text-primary">
                  Pilihan Protein
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span>Ayam Goreng</span>
                    <span className="font-medium">Rp 12.000</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Ayam Laos</span>
                    <span className="font-medium">Rp 13.000</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Rendang Sapi</span>
                    <span className="font-medium">Rp 18.000</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Ikan Bakar</span>
                    <span className="font-medium">Rp 15.000</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Addon Options */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-heading text-lg font-semibold mb-4 text-primary">
                  Lauk Pelengkap
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span>Telur Dadar</span>
                    <span className="font-medium">Rp 5.000</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Orek Tempe</span>
                    <span className="font-medium">Rp 4.000</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Sambal</span>
                    <span className="font-medium">Rp 2.000</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Kerupuk</span>
                    <span className="font-medium">Rp 2.000</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section id="cara-pesan" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Cara Pesan
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Mudah dan cepat, cukup 4 langkah
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: 'Pilih Menu',
                desc: 'Pilih nasi, protein, dan lauk sesuai selera',
              },
              {
                step: 2,
                title: 'Tentukan Jumlah',
                desc: 'Masukkan jumlah pack yang dipesan',
              },
              {
                step: 3,
                title: 'Atur Pengiriman',
                desc: 'Pilih tanggal, waktu, dan alamat pengiriman',
              },
              {
                step: 4,
                title: 'Bayar DP',
                desc: 'Bayar DP 50% untuk konfirmasi pesanan',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Kata Mereka
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ibu Ratna',
                role: 'Panitia Arisan',
                text: 'Nasi kotaknya enak dan porsinya pas. Pengiriman selalu tepat waktu. Recommended!',
              },
              {
                name: 'Pak Budi',
                role: 'HRD Perusahaan',
                text: 'Sudah 3x pesan untuk meeting kantor. Kualitas konsisten dan harganya reasonable.',
              },
              {
                name: 'Mbak Sari',
                role: 'Event Organizer',
                text: 'Menu custom-nya sangat membantu. Tim kami puas dengan pelayanannya.',
              },
            ].map((item) => (
              <Card key={item.name}>
                <CardContent className="pt-6">
                  <div className="flex mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-warning text-warning"
                      />
                    ))}
                  </div>
                  <p className="text-sm mb-4">{item.text}</p>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Siap Memesan?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Pesan sekarang dan nikmati nasi kotak premium untuk acara Anda
          </p>
          <Link href="/menu">
            <Button size="lg">
              Mulai Pesan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                <span className="font-heading text-lg font-bold text-primary">
                  DapurPOS
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistem manajemen catering untuk nasi kotak dan snack
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Menu</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Nasi Kotak</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Snack</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Kue Kering</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Informasi</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cara Pesan</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Kontak</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>WhatsApp: 0812-3456-7890</li>
                <li>Email: info@dapurpos.com</li>
                <li>Alamat: Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            &copy; 2026 DapurPOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
