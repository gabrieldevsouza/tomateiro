import { FiPlus } from "react-icons/fi"

function AddCardSelection() {
  return (
    <button
      type="button"
      aria-label="Adicionar temporizador"
      className="
        card 
        h-full 
        w-full 
        min-w-0 
        min-h-0
        flex 
        items-center 
        justify-center
      "
      >        
      <div className="
      bg-[#374468]
      flex
      aspect-square
      shrink-0
      h-[30%]
      items-center
      justify-center
      rounded-full
      "
      >
      {<FiPlus aria-hidden="true" className="
              text-[#C2C7DA]
              w-[75%]
              h-[75%]
      
            " />}
      </div>
    </button>
  );
}

export default AddCardSelection;