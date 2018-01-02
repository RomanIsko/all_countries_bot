const Telegraf = require('telegraf');
const rp       = require('request-promise');
const bot      = new Telegraf(process.env.BOT_TOKEN);
const Markup   = require('telegraf/markup');

bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username
});

bot.start((ctx) => {
    console.log('started:', ctx.from.id);
    return ctx.reply('Welcome!')
});

bot.command('help', (ctx) => ctx.reply('TODO: here will be help message'));
bot.hears(/\/s (.+)/, ({match, reply}) => {
    if (match[1].length < 2) {
        return reply('Please provide at least 2 chars')
    }
    rp({
        method: 'GET',
        uri   : 'https://restcountries.eu/rest/v2/name/' + match[1] + '?fields=name',
        json  : true
    })
        .then(resp => {
            let keyboard = [];
            for (let country of resp) {
                keyboard.push(Markup.callbackButton(country.name, `c:${country.name}`));
            }
            reply('Please choose a country:',
                Markup.inlineKeyboard(keyboard, {columns: 2}).extra()
            )
        })
        .catch(err => console.log(err))
});

bot.action(/c:.+/, (ctx) => {
    let country = ctx.match[0].replace('c:', '');
    return ctx.reply(`Oh, ${country}! Great choice`)
});

bot.startPolling();