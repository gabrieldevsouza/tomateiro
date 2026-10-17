function AddCardSelection() {
  return (
    <button
      type="button"
      aria-label="Adicionar temporizador"
      className="
        card 
        bg-green-500 
        text-[#212940]
        focus-visible:outline-2
        focus-visible:outline-solid
        focus-visible:outline-current
        focus-visible:-outline-offset-2
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
