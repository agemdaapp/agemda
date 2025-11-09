import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-black mb-4">agemda</h3>
            <p className="text-sm text-gray-600">
              Agendamentos inteligentes para seu negócio.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/planos" className="text-gray-600 hover:text-black transition-colors">
                  Planos
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-600 hover:text-black transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-600 hover:text-black transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacidade" className="text-gray-600 hover:text-black transition-colors">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-gray-600 hover:text-black transition-colors">
                  Termos
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} agemda. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

