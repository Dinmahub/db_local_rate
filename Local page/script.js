const API_URL = "https://script.google.com/macros/s/AKfycbz9grJ1TvwRIB17cOhkWgwRO0Bf8sputsLoH4_xx2t15UE_XCiKxQb0SPKrxhQQHbQQ/exec";

const form = document.querySelector("#rateForm");
const result = document.querySelector("#result");
const price = document.querySelector("#price");
const summary = document.querySelector("#summary");
const reset = document.querySelector("#reset");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const from = document.querySelector("#from").value;
  const to = document.querySelector("#to").value;
  const weight = Number(document.querySelector("#weight").value);

  if (!from || !to || !weight || weight <= 0) {
    alert("Please enter pickup location, destination and weight.");
    return;
  }

  try {
    const url =
      `${API_URL}?pickup=${encodeURIComponent(from)}` +
      `&destination=${encodeURIComponent(to)}` +
      `&weight=${encodeURIComponent(weight)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to connect to the pricing server.");
    }

    const data = await response.json();

    if (!data.success) {
      alert(data.message || "No rate was found.");
      return;
    }

    let estimate = Number(data.price);


    price.textContent = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }).format(estimate);

    summary.textContent =
  `${weight} kg • ${from} → ${to} • ${data.weightBracket}`;

result.hidden = false;

result.scrollIntoView({
  behavior: "smooth",
  block: "center"
});

  } catch (error) {
    console.error(error);
    alert("Unable to retrieve the delivery rate. Please try again.");
  }
});

reset.addEventListener("click", () => {
  result.hidden = true;
  form.reset();

  window.scrollTo({
    top: document.querySelector(".rate-section").offsetTop - 25,
    behavior: "smooth"
  });
});