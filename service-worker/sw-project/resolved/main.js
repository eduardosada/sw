(function () {
  let t = 0;
  const getImage = async function () {
    t--;

    if (t < 1) {
      t = 5;
      const image = document.getElementById("image");
      const counter = document.getElementById("counter");
      try {
        const response = await fetch(
          "https://random.imagecdn.app/v1/image?width=500&height=500&category=animal&format=json"
        );
        const { url } = await response.json();

        image.src = url;
      } catch (error) {
        console.log(error);
      }
    }

    counter.innerHTML = t;
    refresh();
  };

  const refresh = function () {
    setTimeout(getImage, 1000);
  };

  // getImage();
})();
