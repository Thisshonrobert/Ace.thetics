import Post from "./MyComponent/Post";
import Layout from "./MyComponent/layout";

export default function Home() {
  const exampleProducts = [
    {
      id: 1,
      category: "Sneakers",
      brandname: "Nike",  // Updated to brandname
      seoname: "Comfortable and stylish running shoes",
      shop: "Amazon",
      image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.nike.com%2Fin%2Ft%2Fimpact-4-basketball-shoes-CcJxBx&psig=AOvVaw0NiJCYJ8394kPSq-5jpC7J&ust=1728801422891000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLCZ5aediIkDFQAAAAAdAAAAABAE",
    },
    {
      id: 2,
      category: "Sneakers",
      brandname: "Nike",  // Updated to brandname
      seoname: "Comfortable and stylish running shoes",
      shop: "Amazon",
      image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.nike.com%2Fin%2Ft%2Fimpact-4-basketball-shoes-CcJxBx&psig=AOvVaw0NiJCYJ8394kPSq-5jpC7J&ust=1728801422891000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLCZ5aediIkDFQAAAAAdAAAAABAE",
    },
    {
      id: 3,
      category: "Sneakers",
      brandname: "Nike",  // Updated to brandname
      seoname: "Comfortable and stylish running shoes",
      shop: "Amazon",
      image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.nike.com%2Fin%2Ft%2Fimpact-4-basketball-shoes-CcJxBx&psig=AOvVaw0NiJCYJ8394kPSq-5jpC7J&ust=1728801422891000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLCZ5aediIkDFQAAAAAdAAAAABAE",
    },
    {
      id: 4,
      category: "Sneakers",
      brandname: "Nike",  // Updated to brandname
      seoname: "Comfortable and stylish running shoes",
      shop: "Amazon",
      image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.nike.com%2Fin%2Ft%2Fimpact-4-basketball-shoes-CcJxBx&psig=AOvVaw0NiJCYJ8394kPSq-5jpC7J&ust=1728801422891000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLCZ5aediIkDFQAAAAAdAAAAABAE",
    },
    {
      id: 5,
      category: "Sneakers",
      brandname: "Nike",  // Updated to brandname
      seoname: "Comfortable and stylish running shoes",
      shop: "Amazon",
      image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.nike.com%2Fin%2Ft%2Fimpact-4-basketball-shoes-CcJxBx&psig=AOvVaw0NiJCYJ8394kPSq-5jpC7J&ust=1728801422891000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLCZ5aediIkDFQAAAAAdAAAAABAE",
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
