// These were personal access tokens generated on my account (tcoulter)
var tokens = [
  "4861d54367c322d98a40b6f111a7c488235122ce",
  "4de42570febf3ba1252def5c03d1794069f0babe",
  "7b11064ca624f24a553bc815f6ddfaf508c2435a",
  "d5909eadb100760c4797fbd1268b0dd48067f73f",
  "acebcd03e72c57dc6925d95755705ffe21d5e415",
  "5d987e220f12102fd013e38ad0e78c18e653b1e9"
];

export default {
  all: function() {
    return tokens;
  },

  random: function() {
    return tokens[parseInt(Math.random() * tokens.length)];
  }
};
