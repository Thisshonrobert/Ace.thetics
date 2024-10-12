import Post from "./MyComponent/Post";
import Layout from "./MyComponent/layout";

export default function Home() {
  const exampleProducts = [
    {
      id: 1,
      name: "Sneakers",
      brand: "Nike",
      description: "Comfortable and stylish running shoes",
      price: 120,
      image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.nike.com%2Fin%2Ft%2Fimpact-4-basketball-shoes-CcJxBx&psig=AOvVaw0NiJCYJ8394kPSq-5jpC7J&ust=1728801422891000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLCZ5aediIkDFQAAAAAdAAAAABAE",
    },
    {
      id: 2,
      name: "Sunglasses",
      brand: "Ray-Ban",
      description: "Classic aviator sunglasses",
      price: 150,
      image: "https://www.google.com/imgres?q=sunglass&imgurl=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FI%2F51wwVl2r-WL._AC_UY1100_.jpg&imgrefurl=https%3A%2F%2Fwww.amazon.in%2FBlack-Jones-Polarized-Sunglasses-Protection%2Fdp%2FB0CL2GKZM8&docid=oEiH-cIHVvmyTM&tbnid=DkMAH0SJix3AyM&vet=12ahUKEwj7z821nYiJAxVpxTgGHWLxLz0QM3oECGQQAA..i&w=1546&h=1100&hcb=2&ved=2ahUKEwj7z821nYiJAxVpxTgGHWLxLz0QM3oECGQQAA",
    },
    {
      id: 3,
      name: "Jacket",
      brand: "The North Face",
      description: "Waterproof hiking jacket",
      price: 220,
      image: "https://www.google.com/imgres?q=jacket&imgurl=https%3A%2F%2Fwww.voganow.com%2Fcdn%2Fshop%2Ffiles%2FBBGJ-1108-014_2_copy.jpg%3Fv%3D1702101740%26width%3D360&imgrefurl=https%3A%2F%2Fwww.voganow.com%2Fproducts%2Fbbgj-1108-014&docid=CtPxYWx2fTnr_M&tbnid=v6U_4SBhO4eaoM&vet=12ahUKEwjKvai-nYiJAxVfzjgGHUO_E94QM3oECGIQAA..i&w=360&h=360&hcb=2&ved=2ahUKEwjKvai-nYiJAxVfzjgGHUO_E94QM3oECGIQAA",
    },
    {
      id: 4,
      name: "Watch",
      brand: "Rolex",
      description: "Luxury wristwatch with gold accents",
      price: 5000,
      image: "https://www.google.com/imgres?q=watch&imgurl=https%3A%2F%2Fin.danielwellington.com%2Fcdn%2Fshop%2Fproducts%2Fdbd5e5b6734dd6a902ba1b0fae4a7a3f79b62a9c.png%3Fv%3D1679929589%26width%3D1500&imgrefurl=https%3A%2F%2Fin.danielwellington.com%2Fproducts%2Ficonic-link-black-rose-gold&docid=uFPzA5SXokV8gM&tbnid=MmFYcNIZM2yKZM&vet=12ahUKEwitvpfJnYiJAxWS1DgGHSKTDSEQM3oECH0QAA..i&w=1500&h=1500&hcb=2&ved=2ahUKEwitvpfJnYiJAxWS1DgGHSKTDSEQM3oECH0QAA",
    },
    {
      id: 5,
      name: "Backpack",
      brand: "Adidas",
      description: "Durable and stylish sports backpack",
      price: 60,
      image: "https://www.google.com/imgres?q=backpack&imgurl=http%3A%2F%2Fmokobara.com%2Fcdn%2Fshop%2Ffiles%2FThe-Cheddar-Backpack_JB-1.jpg%3Fv%3D1721201934%26width%3D2048&imgrefurl=https%3A%2F%2Fmokobara.com%2Fproducts%2Fthe-cheddar-backpack&docid=opig2GNRJcNF0M&tbnid=4B8s5P-VYgJQbM&vet=12ahUKEwjb2sjSnYiJAxVMxDgGHT5KIpMQM3oECBwQAA..i&w=2000&h=2400&hcb=2&ved=2ahUKEwjb2sjSnYiJAxVMxDgGHT5KIpMQM3oECBwQAA",
    },
  ];

  return (
    <div>
      <Post
        celebrityImage={"/thalapathy.jpg"}
        celebrityName={"Thishi"}
        postDate={"20-09-2002"}
        products={exampleProducts}
      />
      <Post
        celebrityImage={"/thalapathy.jpg"}
        celebrityName={"Thishi"}
        postDate={"20-09-2002"}
        products={exampleProducts}
      />
      <Post
        celebrityImage={"/thalapathy.jpg"}
        celebrityName={"Thishi"}
        postDate={"20-09-2002"}
        products={exampleProducts}
      />
    </div>
  );
}
