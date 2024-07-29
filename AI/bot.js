const express = require('express');
const bodyParser = require('body-parser');
const { NlpManager } = require('node-nlp');
const cors=require('cors')
const app = express();
const port = 3000;

// داده‌های شخصی
const personalData = {
    name: "محمد یوسفی بهتاش",
    city:'تبریز',
    age: 26,
    interests: ["برنامه‌نویسی","کوه نوردی", "مطالعه", "سفر"],
    Year:1377,
    bugraphe:'محمد یوسفی، 26 ساله، در شهر تبریز متولد شده و بزرگ شده‌ام. من دارای مدرک لیسانس در رشته نرم‌افزار هستم و در حال حاضر به عنوان فرانت‌اند کار مشغول به کار هستم. بیشترین علاقه من در زمینه برنامه‌نویسی است، به ویژه به فریمورک (Angular). علاوه بر برنامه‌نویسی، کوهنوردی نیز از علاقه‌مندی‌ها و سرگرمی‌های من است.'
};

// ایجاد و تنظیم NlpManager
const manager = new NlpManager({ languages: ['en'] });

// اضافه کردن مدل‌های NLP ساده
manager.addDocument('en', 'What is your name?', 'personal.name');
manager.addDocument('en', 'How old are you?', 'personal.age');
manager.addDocument('en', 'What are your interests?', 'personal.interests');
manager.addDocument('en', 'Tell me about yourself', 'personal.details');

// اضافه کردن سوالات عمومی
manager.addDocument('en', 'Hello, how are you?', 'general.greeting');
manager.addDocument('en', 'Hi, how are you doing?', 'general.greeting');
manager.addDocument('en', 'What can you do?', 'general.capabilities');

// اضافه کردن پاسخ‌های عمومی
manager.addAnswer('en', 'general.greeting', 'Hello! thank you!');
manager.addAnswer('en', 'general.capabilities', 'I can answer questions about me and general information.');
manager.addAnswer('en', 'personal.name', `My name is ${personalData.name}.`);
manager.addAnswer('en', 'personal.age', `I am ${personalData.age} years old.`);
manager.addAnswer('en', 'personal.interests', `I am interested in ${personalData.interests.join(", ")}.`);
manager.addAnswer('en', 'personal.details', personalData.bugraphe);

// آموزش و ذخیره مدل
(async () => {
    console.log('Training model...');
    await manager.train();
    manager.save();
    console.log('NLP model trained and saved.');
})();

// میانه‌افزارها
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
// پردازش سوالات
async function generateResponse(query) {
    console.log(`Received query: ${query}`);
    const lowerCaseQuery = query.toLowerCase();
    
    // بررسی سوالات پیش‌فرض
    if (lowerCaseQuery.includes("نام") || lowerCaseQuery.includes("نامم")||lowerCaseQuery.includes("اسم") ) {
        return `نام من ${personalData.name} است.`;
    } else if (lowerCaseQuery.includes("سن")) {
        return ` من ${personalData.age} سال سن دارم.`;
    } 
    else if (lowerCaseQuery.includes("خوبی")||lowerCaseQuery.includes("چتوری")) {
        return `مرسی ممنون شما خوب هستین؟`;
    }
    else if (lowerCaseQuery.includes("سلام")) {
        return `سلام خوب هستین؟`;
    }else if (lowerCaseQuery.includes("متولد") || lowerCaseQuery.includes("سال تولد")) {
        return `من متولد ${personalData.Year} هستم`;
    }
     else if (lowerCaseQuery.includes("شهر تولد") ) {
        return `من متولد شهر ${personalData.city} هستم`;
    }
    else if (lowerCaseQuery.includes("علاقه‌مندی") || lowerCaseQuery.includes("علاقه")) {
        return `علاقه‌مندی‌های من عبارتند از: ${personalData.interests.join(", ")}.`;
    }
    else if (lowerCaseQuery.includes("بیوگرافی") || lowerCaseQuery.includes("درباره خودت")|| lowerCaseQuery.includes("درمورد خودت")) {
        return personalData.bugraphe;
    } else {
        // پردازش سوالات غیر از پیش‌فرض با استفاده از NLP
        const response = await manager.process('en', query);
        console.log(`NLP Response: ${JSON.stringify(response)}`);
        return response.answer || "متوجه نشدم. لطفا سوال مشخص‌تری بپرسید.";
    }
}

// مسیرها
app.post('/api/query', async (req, res) => {
    const { query } = req.body;
    const response = await generateResponse(query);
    res.json({ response });
});

// راه‌اندازی سرور
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
