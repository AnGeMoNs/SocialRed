

export const SerializeForm = (form) => {
   const formData = new FormData(form);
   const completeOBJ = {};
   for(let [name, value] of formData)
   {
     completeOBJ[name] = value;
   }
   return completeOBJ;
}
