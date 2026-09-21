function AddCardSelection() {
  return (
    <button
      type="button"
      aria-label="Adicionar temporizador"
      className="
        card 
        bg-green-500 
        shadow-sm
        h-full 
        w-full 
        min-w-0 
        min-h-0
        flex 
        items-center 
        justify-center
      ">
        
      <span aria-hidden="true" 
      className="
      text-4xl
      ">
        +
      </span>
    </button>
  );
}

export default AddCardSelection;