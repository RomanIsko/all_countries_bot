const Telegraf = require('telegraf');
const rp       = require('request-promise');
const bot      = new Telegraf(process.env.BOT_TOKEN);

bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username
});

bot.start((ctx) => {
    console.log('started:', ctx.from.id);
    return ctx.reply('Welcome!')
});

bot.command('help', (ctx) => ctx.reply('TODO: here will be help message'));
bot.hears(/s (.+)/ || /search (.+)/, ({match, reply}) => {
    if (match[1].length < 2) {
        return reply('Please provide at least 2 chars')
    }
    rp({
        method: 'GET',
        uri   : 'https://restcountries.eu/rest/v2/name/' + match[1] + '?fields=name',
        json  : true
    })
        .then(resp => {
            for (let country of resp) {
                reply(country.name)
            }
        })
        .catch(err => console.log(err))
});

bot.startPolling();