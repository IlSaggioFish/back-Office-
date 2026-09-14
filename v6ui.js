/* DX v6 - etichette UI e foglio scenari */
(()=>{
  const link=document.createElement('link');link.rel='stylesheet';link.href='./v6.css?v=6';document.head.appendChild(link);
  document.title='Back Office Adventure DX v6';
  const span=document.querySelector('.header .logo span');if(span)span.textContent='ADVENTURE DX v6';
  const sub=document.querySelector('.header .sub');if(sub)sub.textContent='Scenari completamente ridisegnati: ufficio vivo, labirinto burocratico, cantiere urbano, sala dati e il Regno di Mengasi con arena finale dinamica.';
  const ch=document.querySelector('#credits h2');if(ch)ch.textContent='BACK OFFICE ADVENTURE DX v6';
})();
