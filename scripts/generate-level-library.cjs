const fs = require("node:fs");
const path = require("node:path");
const repoRoot = path.join(__dirname, "..");
const outputRoot = path.resolve(process.argv[2] || path.join(repoRoot, "static-levels-generated"));
const firstRemoteLevel = 11;
const maxArgIndex = process.argv.indexOf("--max-level");
const maxLevel = maxArgIndex >= 0 ? Number(process.argv[maxArgIndex + 1]) : 100000;
const indexChunkSize = 100;
if (!Number.isInteger(maxLevel) || maxLevel < firstRemoteLevel || maxLevel > 100000) throw new Error("--max-level must be an integer from 11 to 100000.");
const levelsDir = path.join(outputRoot, "levels");
const indexesDir = path.join(outputRoot, "indexes");
fs.mkdirSync(levelsDir, { recursive: true });
fs.mkdirSync(indexesDir, { recursive: true });
const families = ["addition","subtraction","multiplication","ascending-sequence","descending-sequence","even-or-odd","largest-number","shape-pattern","everyday-math","number-gap"];
const symbols = ["🔴","🔵","🟢","⭐"];
function options(answer, candidates) {
  const result = [String(answer)];
  for (const item of candidates) if (!result.includes(String(item)) && result.push(String(item)) && result.length === 3) break;
  let n = 1;
  while (result.length < 3) { const value = String(Number(answer) + n++); if (!result.includes(value)) result.push(value); }
  return result;
}
function makeLevel(id) {
  const difficulty = Math.min(10, Math.floor((id - 1) / 10000) + 1);
  const range = 10 + difficulty * 20;
  const family = families[(id - 11) % families.length];
  const a = 2 + ((id * 7) % range), b = 1 + ((id * 13) % range), c = 3 + ((id * 17) % range);
  let prompt, answer, opts, hint, explanation, type, title;
  switch (family) {
    case "addition":
      answer=a+b; prompt=`${a} + ${b} = ?`; opts=options(answer,[answer+2,answer-1,answer+1]); type="Number reasoning"; title="Add the numbers"; hint=["Combine both numbers.",`Start at ${a} and count forward ${b} steps.`]; explanation=`${a} + ${b} = ${answer}.`; break;
    case "subtraction": {
      const larger=Math.max(a,b)+difficulty, smaller=Math.min(a,b); answer=larger-smaller; prompt=`${larger} − ${smaller} = ?`; opts=options(answer,[answer+2,Math.max(0,answer-2),answer+1]); type="Number reasoning"; title="Find the difference"; hint=["Take the smaller number away.",`Count backwards ${smaller} steps from ${larger}.`]; explanation=`${larger} − ${smaller} = ${answer}.`; break;
    }
    case "multiplication": {
      const x=2+((id*3)%(5+difficulty)), y=2+((id*5)%(5+difficulty)); answer=x*y; prompt=`${x} × ${y} = ?`; opts=options(answer,[answer+x,Math.max(1,answer-y),answer+1]); type="Number reasoning"; title="Multiply the numbers"; hint=["Think of equal groups.",`${x} groups of ${y} make the total.`]; explanation=`${x} × ${y} = ${answer}.`; break;
    }
    case "ascending-sequence": {
      const start=1+((id*11)%range), step=1+((id*3)%(2+difficulty)); answer=start+4*step; prompt=`${start}, ${start+step}, ${start+2*step}, ${start+3*step}, ?`; opts=options(answer,[answer+step,answer-step,answer+1]); type="Number pattern"; title="Continue the sequence"; hint=["Look at how much the numbers change.",`Each number increases by ${step}.`]; explanation=`Add ${step} each time; the next number is ${answer}.`; break;
    }
    case "descending-sequence": {
      const step=1+((id*5)%(2+difficulty)), start=50+difficulty*20+((id*7)%range); answer=start-4*step; prompt=`${start}, ${start-step}, ${start-2*step}, ${start-3*step}, ?`; opts=options(answer,[answer-step,answer+step,answer-2*step]); type="Number pattern"; title="Follow the countdown"; hint=["The numbers are getting smaller.",`Subtract ${step} each time.`]; explanation=`Subtract ${step} each time; the next number is ${answer}.`; break;
    }
    case "even-or-odd": {
      const number=10+((id*19)%(range*10)); answer=number%2===0?"Even":"Odd"; prompt=`Is ${number} an even number or an odd number?`; opts=["Even","Odd","Neither"]; type="Number sense"; title="Even or odd?"; hint=["Check the last digit.","Numbers ending in 0, 2, 4, 6, or 8 are even."]; explanation=`${number} is ${answer.toLowerCase()} because its last digit is ${String(number).slice(-1)}.`; break;
    }
    case "largest-number": {
      const values=[a+(id%5),b+((id+3)%7),c+((id+5)%9)]; values[1]+=values[1]===values[0]?2:0; values[2]+=values[2]===values[0]||values[2]===values[1]?3:0; answer=String(Math.max(...values)); prompt=`Which number is the largest: ${values.join(", ")}?`; opts=new Set(values.map(String)).size===3?values.map(String):options(answer,values.map(v=>v+1)); type="Comparison"; title="Compare the numbers"; hint=["Compare the numbers one by one.",`${answer} is greater than the other choices.`]; explanation=`${answer} is the largest number in the list.`; break;
    }
    case "shape-pattern": {
      const group=2+(id%3), first=id%symbols.length, second=(first+1+(id%2))%symbols.length, pattern=[];
      for(let i=0;i<group*2+1;i++) pattern.push(i%(group+1)===0?symbols[first]:symbols[second]);
      answer=symbols[second]; prompt=`${pattern.join(" ")} ?`; opts=[symbols[first],symbols[second],symbols[(second+1)%symbols.length]]; type="Visual reasoning"; title="Spot the pattern"; hint=["Look for the repeating group.","The same small group appears again and again."]; explanation=`The pattern repeats ${symbols[first]} followed by ${symbols[second]} symbols; the next symbol is ${answer}.`; break;
    }
    case "everyday-math": {
      const price=2+((id*7)%range), count=2+(id%5); answer=price*count; prompt=`One notebook costs ${price} coins. How many coins do ${count} notebooks cost?`; opts=options(answer,[answer+price,Math.max(0,answer-price),answer+2]); type="Everyday maths"; title="Solve a daily-life problem"; hint=["Multiply the cost of one item by the number of items.",`${count} groups of ${price} coins make the total.`]; explanation=`${count} × ${price} = ${answer} coins.`; break;
    }
    default: {
      const step=1+(id%(3+difficulty)), start=5+((id*11)%range); answer=start+2*step; prompt=`${start}, ${start+step}, __, ${start+3*step}. Which number is missing?`; opts=options(answer,[answer+step,answer-step,answer+1]); type="Number pattern"; title="Find the missing number"; hint=["Check the difference between nearby numbers.",`Add ${step} each time.`]; explanation=`The missing number is ${answer}.`; break;
    }
  }
  return { id, type, title, prompt, options:opts, answer:String(answer), hint, explanation, difficulty };
}
const chunks = new Map();
for (let id=firstRemoteLevel; id<=maxLevel; id++) {
  const chunk=Math.floor((id-1)/indexChunkSize);
  if(!chunks.has(chunk)) chunks.set(chunk,[]);
  const familyId=families[(id-11)%families.length];
  chunks.get(chunk).push({id,contentId:`mindrivo-level-${String(id).padStart(6,"0")}`,familyId,difficulty:Math.min(10,Math.floor((id-1)/10000)+1),url:`levels/${id}.json`});
  const output=path.join(levelsDir,`${id}.json`), curated=path.join(repoRoot,"levels",`${id}.json`);
  if(id<=17&&fs.existsSync(curated)) fs.copyFileSync(curated,output);
  else fs.writeFileSync(output,JSON.stringify(makeLevel(id)));
}
for(let chunk=0;chunk<Math.ceil(maxLevel/indexChunkSize);chunk++) {
  fs.writeFileSync(path.join(indexesDir,`${String(chunk).padStart(3,"0")}.json`),JSON.stringify({levels:chunks.get(chunk)||[]}));
}
fs.writeFileSync(path.join(outputRoot,"manifest.json"),JSON.stringify({schemaVersion:1,maxLevel,notice:"Public game content only. Never put player data here.",indexChunkSize,levelIndexTemplate:"indexes/{chunk}.json"},null,2)+"\n");
console.log(`Generated ${maxLevel-firstRemoteLevel+1} remote levels and ${Math.ceil(maxLevel/indexChunkSize)} small index files at ${outputRoot}.`);
