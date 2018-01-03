const {Composer, Markup} = require('micro-bot');
const rp                 = require('request-promise');
const svg2png            = require('svg2png');
const bot                = new Composer();

bot.use(Composer.log());

bot.command('start', (ctx) => {
    return ctx.reply('Welcome!')
});

bot.command('help', (ctx) => ctx.reply(
    '/s [country name] - Search country with the pattern\n' +
    '/help - display this help message'));

bot.hears(/\/s (.+)/, ({match, reply}) => {
    if (match[1].length < 2) {
        return reply('Please provide at least 2 chars')
    }
    rp({
        uri : 'https://restcountries.eu/rest/v2/name/' + match[1] + '?fields=name;alpha3Code',
        json: true
    })
        .then(resp => {
            let keyboard = [];
            for (let country of resp) {
                keyboard.push(Markup.callbackButton(country.name, `c:${country.alpha3Code}`));
            }
            return reply('Please choose a country:',
                Markup.inlineKeyboard(keyboard, {columns: 2}).extra()
            )
        })
        .catch(err => {
            if (err.statusCode === 404) {
                reply('Oops, country not found');
            } else {
                reply('Oops, something  is wrong');
            }
            console.log(err)
        })
});

bot.action(/c:.+/, (ctx) => {
    let countryCode = ctx.match[0].replace('c:', '');
    rp({
        method: 'GET',
        uri   : `https://restcountries.eu/rest/v2/alpha/${countryCode}`,
        json  : true
    })
        .then(resp => {
            ctx.replyWithMarkdown(`*Capital:* ${resp.capital}`);
            ctx.replyWithMarkdown(`*Region:* ${resp.region} (${resp.subregion})`);
            ctx.replyWithMarkdown(`*Population:* ${resp.population.toLocaleString()}`);
            ctx.replyWithMarkdown(`*Area:* ${resp.area.toLocaleString()} square kilometers`);
            ctx.replyWithMarkdown(`*Native name:* ${resp.nativeName}`);
            rp(resp.flag)
                .then(svgResp =>
                    svg2png(svgResp)
                        .then(png => {
                                return ctx.replyWithPhoto({source: png})
                            }
                        ))
        })
        .catch(err => console.log(err));
});

module.exports = bot;