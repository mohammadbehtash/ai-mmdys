const { AIMessage, HumanMessage } = require("@langchain/core/messages");
const { tool } = require("@langchain/core/tools");
const { ChatAnthropic } = require("@langchain/anthropic");
const { StateGraph, MemorySaver } = require("@langchain/langgraph");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const express = require('express');
const bodyParser = require('body-parser');
const { z } = require('zod');  // افزودن zod برای اعتبارسنجی
require('dotenv').config();
// تعریف ابزار برای پاسخ به سوالات شخصی
const personalBotTool = tool(async ({ query }) => {
  // تعریف سوالات و پاسخ‌ها
  const responses = {
    "نام تو چیست؟": "من یک ربات هستم. نام خاصی ندارم.",
    "چقدر قد داری؟": "من ربات هستم و قد ندارم!",
    "تو از کجا آمده‌ای؟": "من از فضای مجازی آمده‌ام.",
    "آیا تو انسان هستی؟": "نه، من یک ربات هستم و احساسات انسانی ندارم.",
    "چه کارهایی می‌توانی انجام دهی؟": "من می‌توانم به سوالات شما پاسخ دهم و به شما کمک کنم."
  };

  // جستجو در پاسخ‌ها
  const answer = responses[query] || "متاسفم، من قادر به پاسخ به این سوال نیستم.";
  return answer;
}, {
  name: "personalBot",
  description: "پاسخ به سوالات شخصی.",
  schema: z.object({ query: z.string().describe("پرسش شما") }),
});

// تعریف ابزارها و نودها
const tools = [personalBotTool];
const toolNode = new ToolNode(tools);

const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-20240620",
  temperature: 0,
  apiKey: process.env.LANGCHAIN_API_KEY
}).bindTools(tools);

function shouldContinue(state) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}

async function callModel(state) {
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}

const graphState = {
  messages: {
    reducer: (x, y) => x.concat(y),
  },
};

const workflow = new StateGraph({ channels: graphState })
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const checkpointer = new MemorySaver();
const app = workflow.compile({ checkpointer });

// راه‌اندازی سرور
const server = express();
server.use(bodyParser.json());

server.post('/query', async (req, res) => {
  const { message, thread_id } = req.body;
  const state = { messages: [new HumanMessage(message)] };
  const finalState = await app.invoke(state, { configurable: { thread_id } });
  return res.json(finalState.messages[finalState.messages.length - 1].content);
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
