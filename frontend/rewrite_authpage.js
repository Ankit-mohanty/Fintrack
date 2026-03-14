import fs from 'fs';

let content = fs.readFileSync('src/pages/AuthPage.jsx', 'utf8');

// Replace FloatingCard styles
content = content.replace(
  /className="absolute hidden lg:flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium"[\s\S]*?style=\{\{([\s\S]*?)\}\}/g,
  `className="absolute hidden lg:flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-xl text-[var(--text-primary)] bg-[rgba(22,22,31,0.9)] border border-[rgba(99,102,241,0.2)] backdrop-blur-md transition-all duration-300 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]"
    style={{ top: card.top, left: card.left, right: card.right }}`
);

// Replace main container
content = content.replace(
  /<div style=\{\{\s*minHeight: '100vh',\s*background: 'var\(--bg-primary\)',\s*display: 'flex',\s*alignItems: 'stretch',\s*position: 'relative',\s*overflow: 'hidden'\s*\}\}>/g,
  `<div className="min-h-screen bg-[var(--bg-primary)] flex items-stretch relative overflow-hidden">`
);

// Replace left panel container
content = content.replace(
  /<div style=\{\{\s*flex: 1,\s*display: 'flex',\s*flexDirection: 'column',\s*justifyContent: 'center',\s*alignItems: 'center',\s*padding: '60px',\s*position: 'relative',\s*overflow: 'hidden'\s*\}\} className="hidden lg:flex">/g,
  `<div className="flex-1 hidden lg:flex flex-col justify-center items-center p-[60px] relative overflow-hidden">`
);

// Replace giant gradient circle
content = content.replace(
  /<div style=\{\{\s*position: 'absolute',\s*width: '600px',\s*height: '600px',\s*borderRadius: '50%',\s*background: 'radial-gradient\(circle, rgba\(99,102,241,0.12\) 0%, transparent 70%\)',\s*top: '50%',\s*left: '50%',\s*transform: 'translate\(-50%,-50%\)'\s*\}\} \/>/g,
  `<div className="absolute w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_70%)]" />`
);

// Replace FinTracker text and other text styles
content = content.replace(
  /style=\{\{ textAlign: 'center', zIndex: 1 \}\}/g,
  `className="text-center z-10"`
);

content = content.replace(
  /<div style=\{\{ fontSize: '64px', marginBottom: '24px' \}\}>/g,
  `<div className="text-[64px] mb-6">`
);

content = content.replace(
  /className="gradient-text" style=\{\{ fontSize: '42px', fontWeight: '800', fontFamily: 'Space Grotesk', lineHeight: '1.2', marginBottom: '16px' \}\}/g,
  `className="text-[42px] font-extrabold font-['Space_Grotesk'] leading-[1.2] mb-4 bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent"`
);

content = content.replace(
  /style=\{\{ color: 'var\(--text-secondary\)', fontSize: '18px', maxWidth: '360px', lineHeight: '1.6' \}\}/g,
  `className="text-[var(--text-secondary)] text-lg max-w-[360px] leading-relaxed mx-auto"`
);

content = content.replace(
  /style=\{\{ display: 'flex', gap: '24px', marginTop: '48px', justifyContent: 'center' \}\}/g,
  `className="flex justify-center gap-6 mt-12"`
);

content = content.replace(
  /style=\{\{ textAlign: 'center' \}\}/g,
  `className="text-center"`
);

content = content.replace(
  /style=\{\{ fontSize: '24px', fontWeight: '800', color: 'var\(--accent-light\)' \}\}/g,
  `className="text-2xl font-extrabold text-[var(--accent-light)]"`
);

content = content.replace(
  /style=\{\{ fontSize: '12px', color: 'var\(--text-muted\)', marginTop: '4px' \}\}/g,
  `className="text-xs text-[var(--text-muted)] mt-1"`
);

// Replace Right Panel container
content = content.replace(
  /<div style=\{\{\s*width: '100%',\s*maxWidth: '480px',\s*display: 'flex',\s*alignItems: 'center',\s*justifyContent: 'center',\s*padding: '40px 32px',\s*borderLeft: '1px solid var\(--border\)',\s*background: 'var\(--bg-secondary\)'\s*\}\}>/g,
  `<div className="flex items-center justify-center w-full max-w-[480px] p-[40px_32px] border-l border-[var(--border)] bg-[var(--bg-secondary)]">`
);

content = content.replace(
  /style=\{\{ width: '100%', maxWidth: '380px' \}\}/g,
  `className="w-full max-w-[380px]"`
);

content = content.replace(
  /style=\{\{ marginBottom: '32px', textAlign: 'center' \}\} className="lg:hidden"/g,
  `className="mb-8 text-center lg:hidden"`
);

content = content.replace(
  /<span style=\{\{ fontSize: '32px' \}\}>/g,
  `<span className="text-[32px]">`
);

content = content.replace(
  /className="gradient-text" style=\{\{ fontSize: '24px', fontWeight: '800', fontFamily: 'Space Grotesk' \}\}/g,
  `className="text-[24px] font-extrabold font-['Space_Grotesk'] bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent"`
);

content = content.replace(
  /<div style=\{\{ marginBottom: '32px' \}\}>/g,
  `<div className="mb-8">`
);

content = content.replace(
  /style=\{\{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', fontFamily: 'Space Grotesk' \}\}/g,
  `className="text-[28px] font-extrabold mb-2 font-['Space_Grotesk']"`
);

content = content.replace(
  /style=\{\{ color: 'var\(--text-secondary\)', fontSize: '14px' \}\}/g,
  `className="text-[var(--text-secondary)] text-sm"`
);

// Tab switcher parent
content = content. replace(
  /style=\{\{ display: 'flex', background: 'var\(--bg-card\)', borderRadius: '10px', padding: '4px', marginBottom: '28px', border: '1px solid var\(--border\)' \}\}/g,
  `className="flex bg-[var(--bg-card)] rounded-[10px] p-1 mb-7 border border-[var(--border)]"`
);

// Form styles
content = content.replace(
  /style=\{\{ display: 'flex', flexDirection: 'column', gap: '16px' \}\}/g,
  `className="flex flex-col gap-4"`
);

// Form labels
content = content.replace(
  /style=\{\{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var\(--text-secondary\)', marginBottom: '6px' \}\}/g,
  `className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5"`
);

// Form input positions
content = content.replace(
  /style=\{\{ position: 'relative' \}\}/g,
  `className="relative"`
);

// Icon positions
content = content.replace(
  /style=\{\{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY\(-50%\)', color: 'var\(--text-muted\)' \}\}/g,
  `className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"`
);

// Input classes
content = content.replace(
  /className="input-field" style=\{\{ paddingLeft: '40px' \}\}/g,
  `className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[10px] py-3 pr-4 pl-10 text-[var(--text-primary)] text-sm font-sans transition-all duration-200 outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] placeholder:text-[var(--text-muted)]"`
);

content = content.replace(
  /className="input-field" style=\{\{ paddingLeft: '40px', paddingRight: '44px' \}\}/g,
  `className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[10px] py-3 pl-10 pr-11 text-[var(--text-primary)] text-sm font-sans transition-all duration-200 outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] placeholder:text-[var(--text-muted)]"`
);

// Eye toggle button
content = content.replace(
  /style=\{\{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY\(-50%\)', background: 'none', border: 'none', cursor: 'pointer', color: 'var\(--text-muted\)' \}\}/g,
  `className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"`
);

// Demo credentials box
content = content.replace(
  /style=\{\{ marginTop: '24px', padding: '16px', background: 'rgba\(99,102,241,0.08\)', borderRadius: '10px', border: '1px solid rgba\(99,102,241,0.15\)' \}\}/g,
  `className="mt-6 p-4 bg-[rgba(99,102,241,0.08)] rounded-[10px] border border-[rgba(99,102,241,0.15)]"`
);

content = content.replace(
  /style=\{\{ fontSize: '12px', color: 'var\(--text-secondary\)', marginBottom: '6px', fontWeight: '600' \}\}/g,
  `className="text-xs text-[var(--text-secondary)] mb-1.5 font-semibold"`
);

content = content.replace(
  /style=\{\{ fontSize: '12px', color: 'var\(--text-muted\)' \}\}/g,
  `className="text-xs text-[var(--text-muted)]"`
);

content = content.replace(
  /className="btn-primary" disabled=\{isLoading\}\s*style=\{\{\s*width: '100%',\s*padding: '14px',\s*fontSize: '15px',\s*marginTop: '8px',\s*display: 'flex',\s*alignItems: 'center',\s*justifyContent: 'center',\s*gap: '8px'\s*\}\}/g,
  `className="w-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white border-none rounded-[10px] p-3.5 mt-2 flex items-center justify-center gap-2 font-semibold text-[15px] cursor-pointer transition-all duration-200 relative overflow-hidden active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"\n              disabled={isLoading}`
);

fs.writeFileSync('src/pages/AuthPage.jsx', content, 'utf8');
console.log('Conversion successful');
