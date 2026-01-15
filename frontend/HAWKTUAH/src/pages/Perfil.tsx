import Foto from '../img/hawktu.png'

export default function Perfil() {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-6">
            <div className="card sm-1 my-5">
                Preto
                <img src={Foto} alt="FotoPerfil" />
            </div>
          </div>
          <div className="col-6 my-5">
            <form>
                <label className="form-label">Username</label>
                <input type="text" className="form-control"></input>
                <label className="form-label">Nome</label>
                <input type="text" className="form-control"></input>
                <label className="form-label">Email</label>
                <input type="email" className="form-control"></input>
            </form>
            <button className="btn">Alterar palavra Password</button>
          </div>
        </div>
      </div>
    </>
  );
}
