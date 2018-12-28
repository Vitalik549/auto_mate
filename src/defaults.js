const DEFAULT_VARIABLES = [
    { "key": "var 1", "value": "val 1" },
    { "key": "var 2", "value": "val 2" }
]

const DEFAULT_BUTTONS =  [
    {"buttonName":"Open google","isHidden":false,"isSplit":false,"script":"await MATE.createTab('https://google.com');\ndocument.querySelector('[name=q]').value = 'tet';\n"},{"buttonName":"New button","isHidden":false,"isSplit":false,"script":"console.log(1)"}
]