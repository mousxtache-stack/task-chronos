import { useState, useEffect, useRef } from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import "./SmoothCaretInput.css"; // Nous importons les styles CSS personnalisés

export function SmoothCaretInput({ className, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const caretRef = useRef(null);
  const [caretPosition, setCaretPosition] = useState(0);
  
  // Gestion de la position du curseur
  const updateCaretPosition = () => {
    if (!inputRef.current || !caretRef.current) return;
    
    const inputEl = inputRef.current;
    const caretEl = caretRef.current;
    
    // Récupérer la position du curseur
    const selectionStart = inputEl.selectionStart || 0;
    setCaretPosition(selectionStart);
    
    // Créer un span temporaire pour calculer la position du texte
    const textBeforeCaret = props.value.substring(0, selectionStart);
    const measureSpan = document.createElement('span');
    measureSpan.textContent = textBeforeCaret || '.';
    measureSpan.style.font = window.getComputedStyle(inputEl).font;
    measureSpan.style.position = 'absolute';
    measureSpan.style.visibility = 'hidden';
    measureSpan.style.whiteSpace = 'pre';
    document.body.appendChild(measureSpan);
    
    // Calculer la position X du curseur
    const paddingLeft = parseInt(window.getComputedStyle(inputEl).paddingLeft, 10);
    const inputWidth = textBeforeCaret ? measureSpan.offsetWidth : 0;
    document.body.removeChild(measureSpan);
    
    // Appliquer la position avec une transition
    caretEl.style.transform = `translateX(${paddingLeft + inputWidth}px)`;
  };

  // Mettre à jour la position du curseur
  useEffect(() => {
    if (isFocused) {
      updateCaretPosition();
      
      // Ajouter des écouteurs d'événements pour les mouvements du curseur
      const onSelectionChange = () => {
        requestAnimationFrame(updateCaretPosition);
      };
      
      document.addEventListener('selectionchange', onSelectionChange);
      return () => document.removeEventListener('selectionchange', onSelectionChange);
    }
  }, [isFocused, props.value]);

  return (
    <div className="smooth-caret-container">
      <ShadcnInput
        {...props}
        ref={inputRef}
        className={`smooth-caret-input ${className || ''}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={updateCaretPosition}
        onKeyUp={updateCaretPosition}
      />
      {isFocused && (
        <div 
          ref={caretRef}
          className="smooth-caret"
        />
      )}
    </div>
  );
}