////Si el usuario tiene token lo enviamos a index
export default function({ store, redirect }) {
    store.dispatch('readToken');

    if (store.state.auth) { //si tine un token en auth lo redirecionamos a dashboard
        return redirect('/dashboard')
    }
}  