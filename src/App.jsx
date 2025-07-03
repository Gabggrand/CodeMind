import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [codigo, setCodigo] = useState('');
  const [codigoCorrigido, setCodigoCorrigido] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);

  const [conversas, setConversas] = useState(() => {
    const saved = localStorage.getItem('conversasCodemind');
    return saved ? JSON.parse(saved) : [];
  });
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [conversaAtivaId, setConversaAtivaId] = useState(() => {
    const saved = localStorage.getItem('conversaAtivaIdCodemind');
    return saved ? Number(saved) : null;
  });

  const conversaAtiva = conversas.find(c => c.id === conversaAtivaId);

  useEffect(() => {
    localStorage.setItem('conversasCodemind', JSON.stringify(conversas));
  }, [conversas]);

  useEffect(() => {
    if (conversaAtivaId !== null) {
      localStorage.setItem('conversaAtivaIdCodemind', conversaAtivaId.toString());
    }
  }, [conversaAtivaId]);

  const corrigirCodigo = (texto) => {
    let corrigido = texto;
    corrigido = corrigido.replace(/<h1>(.*?)<h1>/gi, '<h1>$1</h1>');
    corrigido = corrigido.replace(/console\.log/gi, 'console.error');
    corrigido = corrigido.replace(/(let\s+\w+\s*=\s*[^;]+)(\n|$)/g, '$1;$2');
    corrigido = corrigido.replace(/function\s*\(\)/g, 'function unnamed()');
    return corrigido;
  };

  const gerarTitulo = (texto) => {
    if (!texto) return 'Sem título';
    return texto.length > 20 ? texto.slice(0, 20) + '...' : texto;
  };

  const enviarCodigo = () => {
    if (!codigo.trim() || !conversaAtiva) return;

    setCodigoCorrigido('Corrigindo...');

    setTimeout(() => {
      const corrigido = corrigirCodigo(codigo);

      const novoItem = {
        id: Date.now(),
        titulo: gerarTitulo(codigo),
        codigoOriginal: codigo,
        codigoCorrigido: corrigido,
        timestamp: new Date(),
      };

      const novaConversa = {
        ...conversaAtiva,
        historico: [novoItem, ...(conversaAtiva.historico || [])],
      };

      setConversas(prev => prev.map(c => c.id === conversaAtivaId ? novaConversa : c));
      setItemSelecionado(novoItem);
      setCodigoCorrigido(corrigido);
      setCodigo('');
    }, 1000);
  };

  const carregarHistorico = (item) => {
    setItemSelecionado(item);
    setCodigo(item.codigoOriginal);
    setCodigoCorrigido(item.codigoCorrigido);
  };

  const copiarCodigoCorrigido = () => {
    if (!codigoCorrigido.trim()) return;
    navigator.clipboard.writeText(codigoCorrigido);
  };

  const enviarMensagem = () => {
    if (!mensagem.trim() || !conversaAtiva) return;

    const respostaSimulada = `Simulação: você disse "${mensagem}"`;

    const novoItem = {
      id: Date.now(),
      pergunta: mensagem,
      resposta: respostaSimulada,
      timestamp: new Date(),
    };

    const novaConversa = {
      ...conversaAtiva,
      mensagens: [...(conversaAtiva.mensagens || []), novoItem],
    };

    setConversas(prev => prev.map(c => c.id === conversaAtivaId ? novaConversa : c));
    setMensagem('');
  };

  function criarNovaConversa() {
    const novaConversa = {
      id: Date.now(),
      titulo: `Chat ${conversas.length + 1}`,
      historico: [],
      mensagens: [],
    };

    setConversas(prev => [novaConversa, ...prev]);
    setConversaAtivaId(novaConversa.id);
    setCodigo('');
    setCodigoCorrigido('');
    setMensagem('');
    setItemSelecionado(null);
    setMenuAberto(false);
  }

  return (
    <div className="flex h-screen w-screen bg-[#2C2C2C] overflow-hidden">
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-[#1F1F1F] p-4 z-30 flex-col text-center overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${menuAberto ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:flex
        `}
      >
        <button
          onClick={() => setMenuAberto(false)}
          className="md:hidden self-end mb-4 p-2 rounded bg-red-600 text-white"
          aria-label="Fechar menu"
        >
          ✕
        </button>

        <button
          onClick={criarNovaConversa}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          Nova Chat
        </button>
        <h2 className="text-white font-bold mb-4">Chats</h2>
        <section className="w-full h-full overflow-y-auto">
          {conversas.length === 0 ? (
            <p className="text-gray-400">Nenhum histórico ainda.</p>
          ) : (
            conversas.map((chat) => (
              <a
                key={chat.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setConversaAtivaId(chat.id);
                  setItemSelecionado(null);
                  setCodigo('');
                  setCodigoCorrigido('');
                  setMensagem('');
                  setMenuAberto(false);
                }}
                className={`block mt-2 px-3 py-1 rounded cursor-pointer ${conversaAtivaId === chat.id
                  ? 'bg-gray-600 text-white font-bold'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                {chat.titulo}
              </a>
            ))
          )}
        </section>
      </aside>

      <main className="flex-1 flex flex-col p-6 items-center justify-start overflow-y-auto relative h-full">
        {!menuAberto && (
          <button
            onClick={() => setMenuAberto(true)}
            className="md:hidden absolute top-4 left-4 bg-blue-600 text-white p-2 rounded z-40"
            aria-label="Abrir menu"
          >
            ☰
          </button>
        )}

        <header className="mt-2 mb-12 text-center">
          <h1 className="text-white text-2xl font-bold">CodeMind</h1>
        </header>

        <div className='mt-2 mb-9 flex- md:flex-row items-center text-center justify-center w-full font-bold'>
          <h2 className="text-white text-lg">Envie seu código</h2>
          <p className="text-white text-sm">Correção automática instantânea</p>
        </div>

        <section className="bg-[#282C34] rounded p-4 shadow-md mb-6 flex flex-col w-full max-w-5xl
            max-h-[300px] md:max-h-none
            overflow-hidden
        ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-auto">
            <textarea
              className="w-full bg-[#1E1E1E] text-white p-3 rounded border border-gray-600 font-mono text-sm resize-none outline-none"
              placeholder="Digite ou cole seu código aqui..."
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              rows={10}
            />
            <textarea
              readOnly
              value={codigoCorrigido}
              className="w-full bg-[#1E1E1E] text-white p-3 rounded border border-gray-600 font-mono text-sm resize-none outline-none"
              placeholder="O código corrigido aparecerá aqui..."
              rows={10}
            />
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={enviarCodigo}
              className="bg-[#696969] hover:bg-[#808080] text-white px-6 py-2 rounded"
            >
              Enviar
            </button>
            <button
              onClick={copiarCodigoCorrigido}
              className="bg-[#696969] hover:bg-[#808080] text-white px-6 py-2 rounded"
            >
              Copiar
            </button>
          </div>
        </section>

        <div className="rounded p-4 w-full max-w-5xl flex-grow overflow-y-auto text-white text-sm text-center mb-10">
          {!conversaAtiva?.mensagens?.length ? (
            <p className="text-white font-bold">As respostas aparecerão aqui</p>
          ) : (
            conversaAtiva.mensagens.map((item, index) => (
              <div key={index} className="mb-2 text-left">
                <p className="text-right">
                  <strong>Você:</strong> {item.pergunta}
                </p>
                <p>
                  <strong>IA:</strong> {item.resposta}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="w-full max-w-5xl">
          <input
            type="text"
            placeholder="Fale comigo"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
            className="bg-[#272727] w-full h-12 p-3 rounded-md text-white outline-none"
          />
        </div>
      </main>
    </div>
  );
}
