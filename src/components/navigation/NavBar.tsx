import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useNear } from '@/contexts/NearContext';
import { useDisconnect } from 'wagmi';
import { Home, Calendar, Radio, Menu, X, Users, Gift, Smartphone, Lock as LockIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from '@/assets/web3radio-logo.png';
import { Capacitor } from '@capacitor/core';

const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLUListElement>(null);
  const animRef = useRef<number | null>(null);
  const [currentActiveItem, setCurrentActiveItem] = useState<HTMLAnchorElement | null>(null);

  // Unified Multi-chain State
  const { open: openAppKit } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { disconnect: disconnectEVM } = useDisconnect();
  
  // Near State
  const { accountId, isConnected: isNearConnected, connect: connectNear, disconnect: disconnectNear } = useNear();
  const isConnectedAny = isConnected || isNearConnected;
  
  const networkName = isNearConnected ? 'NEAR' : (caipNetwork?.name || 'Unknown');
  const displayAddress = address || accountId;

  const isAndroid = Capacitor.getPlatform() === 'android';

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    ...(isAndroid ? [] : [
      { to: '/events', label: 'News & Events', icon: Calendar },
      { to: '/rental', label: 'Rental', icon: Smartphone },
      { to: '/ply', label: 'Prizes', icon: Gift },
      { to: '/dao', label: 'DAO', icon: Users },
      { to: 'https://app.webthreeradio.xyz/', label: 'App', icon: Radio, external: true },
    ]),
  ].filter(link => {
    if (isAndroid) {
      return !['/ply', '/dao'].includes(link.to);
    }
    return true;
  });

  const animate = useCallback((from: number, to: number) => {
    if (animRef.current) clearInterval(animRef.current);
    if (!navRef.current) return;

    const start = Date.now();
    const nav = navRef.current;

    animRef.current = window.setInterval(() => {
      const p = Math.min((Date.now() - start) / 500, 1);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic

      const x = from + (to - from) * e;
      const y = -40 * (4 * e * (1 - e));
      const r = 200 * Math.sin(p * Math.PI);

      nav.style.setProperty('--translate-x', `${x}px`);
      nav.style.setProperty('--translate-y', `${y}px`);
      nav.style.setProperty('--rotate-x', `${r}deg`);

      if (p >= 1) {
        if (animRef.current) clearInterval(animRef.current);
        animRef.current = null;
        nav.style.setProperty('--translate-y', '0px');
        nav.style.setProperty('--rotate-x', '0deg');
      }
    }, 16);
  }, []);

  const getCurrentPosition = () => parseFloat(navRef.current?.style.getPropertyValue('--translate-x') || '0') || 0;

  const getItemCenter = (item: HTMLElement) => {
    if (!navRef.current) return 0;
    const navRect = navRef.current.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    return itemRect.left + itemRect.width / 2 - navRect.left - 6; // -6 for half of dot width (12px)
  };

  const moveToItem = (item: HTMLElement) => {
    const current = getCurrentPosition();
    const center = getItemCenter(item);
    animate(current, center);
    navRef.current?.classList.add('show-indicator');
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    moveToItem(e.currentTarget);
  };

  const handleMouseLeaveNav = () => {
    if (currentActiveItem) {
      moveToItem(currentActiveItem);
    } else {
      navRef.current?.classList.remove('show-indicator');
      if (animRef.current) {
        clearInterval(animRef.current);
        animRef.current = null;
      }
    }
  };

  useEffect(() => {
    const links = navRef.current?.querySelectorAll('a');
    if (links) {
      let found = false;
      links.forEach(link => {
        const to = link.getAttribute('href');
        if (to === location.pathname) {
          setCurrentActiveItem(link as HTMLAnchorElement);
          moveToItem(link as HTMLAnchorElement);
          found = true;
        }
      });
      if (!found) {
        navRef.current?.classList.remove('show-indicator');
      }
    }
  }, [location.pathname]);

  return (
    <header className="fixed top-0 w-full z-[100] px-4">
      <style>{`
        .nav-container {
          position: fixed;
          width: fit-content;
          inset-inline: 0px;
          margin: auto;
          margin-top: 25px;
          padding: 0 10px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          overflow: visible;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
          isolation: isolate;
        }

        .nav-container:before {
          content: '';
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: url(#wave-distort);
          z-index: -2;
          border-radius: 20px;
        }

        .nav-list {
          position: relative;
          list-style: none;
          display: flex;
          justify-content: center;
          height: 52px;
          isolation: isolate;
          padding: 0 10px;
        }

        .nav-list::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 6px;
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
          transform: translateX(var(--translate-x, 0)) translateY(var(--translate-y, 0)) rotate(var(--rotate-x, 0deg));
          transition: none;
          opacity: 0;
          z-index: -1;
          box-shadow: 0 2px 8px rgba(255, 255, 255, 0.4);
          border: 1.5px solid rgba(255, 255, 255, 0.8);
        }

        .nav-list.show-indicator::after {
          opacity: 1;
        }

        .nav-link {
          position: relative;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-weight: 800;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding-inline: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        .nav-link:hover, .nav-link.active {
          opacity: 1;
          color: #ffffff;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
           .nav-container {
             width: 95vw;
             padding: 0 5px;
             margin-top: 15px;
           }
           .nav-link {
             padding-inline: 8px;
             font-size: 0.6rem;
             letter-spacing: 0.05em;
           }
           .nav-desktop-only {
             display: none;
           }
        }
      `}</style>

      <nav className="nav-container">
        <Link to="/" className="flex items-center ml-3 nav-desktop-only hover:scale-105 transition-transform">
          <img src={logo} alt="Web3Radio" className="w-8 h-8 rounded-lg" />
        </Link>

        <ul ref={navRef} className="nav-list" onMouseLeave={handleMouseLeaveNav}>
          {navLinks.map((link) => (
            <li key={link.to}>
              {link.to.startsWith('http') ? (
                <a
                  href={link.to}
                  target="_blank"
                  rel="noreferrer"
                  className="nav-link"
                  onMouseEnter={handleMouseEnter}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={link.to}
                  className={cn("nav-link", location.pathname === link.to && "active")}
                  onMouseEnter={handleMouseEnter}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Wallet Connection */}
        <div className="mr-2 nav-desktop-only flex items-center gap-2">
          {!isConnectedAny ? (
            <>
              <button
                onClick={() => openAppKit()}
                className="px-3 py-2 bg-gradient-to-r from-violet-600/80 to-indigo-600/80 text-white rounded-xl font-bold text-[8px] uppercase tracking-wider shadow-sm hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center gap-1.5"
              >
                Solana/EVM
              </button>
              <button
                onClick={() => connectNear()}
                className="px-3 py-2 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white rounded-xl font-bold text-[8px] uppercase tracking-wider shadow-sm hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-1.5"
              >
                Near
              </button>
            </>
          ) : (
            <button
              onClick={() => isNearConnected ? disconnectNear() : openAppKit({ view: 'Account' })}
              className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-xl font-mono text-[9px] shadow-sm hover:bg-white/20 transition-all flex items-center gap-1.5 group"
            >
              <div className={cn("w-1.5 h-1.5 rounded-full", isNearConnected ? "bg-cyan-400" : "bg-emerald-500")} />
              <span>{displayAddress?.slice(0, 4)}...{displayAddress?.slice(-4)}</span>
              <span className="text-[7px] opacity-0 group-hover:opacity-60 transition-opacity ml-1">Disconnect</span>
            </button>
          )}
        </div>

        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-16 mx-auto w-[92vw] glass border border-white/30 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-5 flex flex-col gap-3">
            {navLinks.map((link) => (
              link.to.startsWith('http') ? (
                <a
                  key={link.to}
                  href={link.to}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-white/70 hover:bg-white/10 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon size={20} />
                  <span className="uppercase tracking-widest text-[11px]">{link.label}</span>
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all",
                    location.pathname === link.to ? "bg-white text-black shadow-lg" : "text-white/70 hover:bg-white/10"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon size={20} />
                  <span className="uppercase tracking-widest text-[11px]">{link.label}</span>
                </Link>
              )
            ))}
            <div className="h-px bg-white/10 my-1" />
            {!isConnectedAny ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { openAppKit(); setMobileMenuOpen(false); }}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-sm active:scale-95 transition-transform"
                >
                  Connect Solana/EVM
                </button>
                <button
                  onClick={() => { connectNear(); setMobileMenuOpen(false); }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-sm active:scale-95 transition-transform"
                >
                  Connect Near
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { isNearConnected ? null : openAppKit({ view: 'Account' }); setMobileMenuOpen(false); }}
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", isNearConnected ? "bg-cyan-400" : "bg-emerald-500")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{networkName}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white">{displayAddress?.slice(0, 8)}...{displayAddress?.slice(-4)}</span>
                </button>
                <button
                  onClick={() => { isNearConnected ? disconnectNear() : disconnectEVM(); setMobileMenuOpen(false); }}
                  className="w-full py-2 text-[10px] font-bold text-red-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <svg className="hidden">
        <defs>
          <filter id="wave-distort" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0038 0.0038" numOctaves="1" seed="2" result="roughNoise" />
            <feGaussianBlur in="roughNoise" stdDeviation="8.5" result="softNoise" />
            <feComposite operator="arithmetic" k1="0" k2="1" k3="2" k4="0" in="softNoise" result="mergedMap" />
            <feDisplacementMap in="SourceGraphic" in2="mergedMap" scale="-42" xChannelSelector="G" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </header>
  );
};

export default NavBar;
