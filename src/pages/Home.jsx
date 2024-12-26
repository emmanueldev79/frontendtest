import { ContainerProducts } from "../components/ContainerProducts";
export const Home = () => {
  return (
    <>
      <main className="Home">
        <h1>
          Discover the latest <br></br> eco-friendly fashion
        </h1>
        <section className="search">
          <input type="text" placeholder="Search" name="" id="" />
          <button className="button-search">Search</button>
        </section>
      </main>
      <ContainerProducts></ContainerProducts>
    </>
  );
};
