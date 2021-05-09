//Este authenticated lo ejecutamos donde el useario, tiene que estar ya registrado 
//para poder trabajar
//si el usuario no tiene token lo enviamos a login  
export default function({ store, redirect }) {

    store.dispatch("readToken");//las acciones en store index se llaman con dispatch
  
    if (!store.state.auth) { //sino hay nada en auth se redirecciona al login
      return redirect("/login");
    }
  }