/** Runs before first paint: plays the intro once per session and never for reduced-motion users. */
export const INTRO_GATE = `try{var d=document.documentElement;if(sessionStorage.getItem('jm-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro-skip')}else{d.classList.add('intro-on');sessionStorage.setItem('jm-intro','1')}}catch(e){}`;
