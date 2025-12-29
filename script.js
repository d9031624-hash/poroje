function setAngle(deg) {
  document.getElementById("line").style.transform =
    `rotate(${deg}deg)`;

  document.getElementById("deg").innerText =
    Number(deg).toFixed(1);

  // محاسبه درصد شیب
  let percent = Math.tan(deg * Math.PI / 180) * 100;
  document.getElementById("percent").innerText =
    percent.toFixed(2);
}
