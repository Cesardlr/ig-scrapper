"use strict"

const puppeteer = require('puppeteer');

async function script(username) {

    // Setting up puppeteer
    const browser = await puppeteer.launch({ args: ['--incognito'], headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/accounts/login', { waitUntil: 'networkidle2' });

    // usarnem and password for logging in an account to get into instagram
    await page.type('input[name=username]', 'account');
    await page.type('input[name=password]', 'password', { delay: 20 });
    await page.click('button[type=submit]', { delay: 20 })
    await page.waitForTimeout(5000);


    const notifyBtns = await page.$x("//button[contains(text(), 'Ahora no')]")

    if (notifyBtns) {
        await notifyBtns[0].click()
    } else {
        console.log('no notifications buttons to click')
    }


    // Entrando a la pagina de el usuario
    await page.goto(`https://www.instagram.com/${username}`, { waitUntil: "networkidle2" })
    await page.waitForTimeout(3000)



    // Buscamos el boton de los seguidores
    const followersBtn = await page.$('div[id=react-root] section main div header ' + 'section ul li:nth-child(2) a')
    // Se usa evaluate para poder usar ese boton
    await followersBtn.evaluate(btn => btn.click())
    await page.waitForTimeout(3000)




    const followersDialog = 'div[role="dialog"] div:nth-child(2)'
    await page.waitForSelector('div[role="dialog"] div:nth-child(2) ul')
    await scrollDown(followersDialog, page)
    console.log('getting followers')






    // ESTABLECIENDO LOS QUERY SELECTORS
    // const list1 = await page.$$('div[role="dialog"] div:nth-child(2) ul div li div' + ' div div:nth-child(2) div a')
    await page.waitForSelector('div[role="dialog"] div:nth-child(2) ul li div div div a img')
    const list1 = await page.$$('div[role="dialog"] div:nth-child(2) ul li div ' + 'div div div span a')

    // Aqui puse uno por si tiene historias tiene span y si no tiene un enlace por lo que son 2 diferentes selector, por eso es un array con 2 paths
    let avatarPaths = [
        'div[role="dialog"] div:nth-child(2) ul div li div div div a img',
        'div[role="dialog"] div:nth-child(2) ul div li div div div span img',
    ]



    // Lista para las imagenes
    const pics1 = await avatarPaths.reduce(async (accProm, path) => {
        const acc = await accProm

        // Usamos eval que es como usar document.querySelector pero podemos hacer algo con eso y los datos que devuelve la promesa
        // Filtramos por los 2 paths que hay arriba
        const arr = await page.$$eval(path, res => {

            // Aqui estamos obteniendo cada uno de las imagenes de cada bloque en la lista
            return res.map(pic => {

                // Obteniendo el alt que esta dentro de la imagen
                const alt = pic.getAttribute('alt')

                // Aqui voy a obtener el username que ya esta dentro del alt tambien, ento nces usaremos split con un codigo regex
                const strings = alt.split(/(['])/g)
                return {
                    username: strings[0],
                    avatar: pic.getAttribute('src')
                }
            })
        })

        // devolvemos e Insertamos al acumulador todas las imagenes que devolvio el .map() del array para sacar todas las imagenes
        return acc.concat([...arr])

        // Esto se pone por que puppeteer tiene que resolver una promesa (Que es lo que devuelve la funcion) al final de la ejecucion
    }, Promise.resolve([]));




    // Ahora creamos una lista para los followers extrayendo todos los datos para el renderizado de estos en el dom
    const followers = await Promise.all(list1.map(async item => {
        // Sacamos el username de cada item de la lista
        const usernameJsHandle = await item.getProperty('innerText')
        username = await usernameJsHandle.jsonValue()

        // Sacamos la imagen con el find desde la lista de pics1, con un condicional para ver si la imagen de la lista de pics1 tiene el mismo usuario que el username que acabamos de sacar, si no solo va a regresar un avatar en blanco
        const pic = pics1.find(p => p.username === username) || { avatar: "" }

        console.log('se obtuvieron los followers')

        // Devolvemos el avatar de la imagen y el username
        return {
            avatar: await pic.avatar,
            username
        }
    }))



    
    // Ahora vemos el boton para cerrar
    const closeBtn = await page.$('div[role="dialog"] div div div:nth-child(3)' + ' button')
    await closeBtn.evaluate(btn => btn.click())











    //---------------------------------------------------------------- EMPEZANDO PROCESO DE FOLLOWING SEARCH -------------------------------------------------------- 
    // Sacamos el botor de siguiendo y le damos click
    const followingBtn = await page.$('div[id=react-root] section main div ' + 'header section ul li:nth-child(3) a')
    await followingBtn.evaluate(btn => btn.click())
    await page.waitForTimeout(3000)


    // Esta es la pop-up window para quien estas siguiendo
    const followingDialog = 'div[role="dialog"] div div:nth-of-type(3)'
    await page.waitForSelector('div[role="dialog"] div div:nth-of-type(3) ul')
    await scrollDown(followingDialog, page);
    console.log('getting following')


    // Hacemos la segunda lista para cuando ya entremos en el perfil de el usuario que queremos checar este nos de los datos de las personas a las que sigue
    // El doble $$ es como un qeyrselector all
    const list2 = await page.$$('div[role="dialog"] div div:nth-of-type(3) ul div li div:nth-child(2) div a')

    await page.waitForSelector('div[role="dialog"] div div:nth-of-type(3) ul div li div div a img')

    // El que tiene span es por que aveces tienen historias y si tienen historias se convierten en un span en vez de un enlace a
    avatarPaths = [
        'div[role="dialog"] div div:nth-of-type(3) ul div li div div a img',

        'div[role="dialog"] div div:nth-of-type(3) ul div li div div span img'
    ]



    // Obtenemos todas las imagenes pero con otra lista

    const pics2 = await avatarPaths.reduce(async (accProm, path) => {
        const acc = await accProm

        // Usamos eval que es como usar document.querySelector pero podemos hacer algo con eso y los datos que devuelve la promesa
        const arr = await page.$$eval(path, res => {

            // Aqui estamos obteniendo cada uno de las imagenes de cada bloque en la lista
            return res.map(pic => {

                // Obteniendo el alt que esta dentro de la imagen
                const alt = pic.getAttribute('alt')

                // Aqui voy a obtener el username que ya esta dentro del alt tambien, ento nces usaremos split con un codigo regex
                const strings = alt.split(/(['])/g)
                return {
                    username: strings[0],
                    avatar: pic.getAttribute('src')
                }
            })
        })
        // devolvemos e Insertamos al acumulador todas las imagenes que devolvio el .map() del array para sacar todas las imagenes
        return acc.concat([...arr])

        // Esto se pone por que puppeteer tiene que resolver una promesa al final de la ejecucion
        // Promise.all lo que hace es que ejecuta una serie de iterables e incluso puede manejar promesas, si una de estas falla tira un error y no se podran extraer ninguno de los datos
    }, Promise.resolve([]));


    // Ahora seguimos a las personas que nosotros seguimos
    // Sacams el username de cada item de la lista
    const following = await Promise.all(list2.map(async item => {

        // Lo de json.Value() lo que hace es que ejecuta JSON.stringify en el objeto dentro de la pagina y JSON.parse en puppeteer lo que regresa el texto
        const usernameJsHandle = await await item.getProperty('innerText')
        username = await usernameJsHandle.jsonValue()

        // Sacamos la imagen con el find desde la lista de pics1, con un condicional para ver si la imagen de la lista de pics1 tiene el mismo usuario que el username que acabamos de sacar, si no solo va a regresar un avatar en blanco
        const pic = pics2.find(p => p.username === username) || { avatar: "" }

        console.log('se obtuvieron los followings')


        // Devolvemos el avatar de la imagen y el username
        return {
            avatar: await pic.avatar,
            username
        }
    }))




    // Obtenemos la cantidad de followers
    const followerCnt = followers.length
    // Obtenemos la cantidad de personas que seguimos
    const followingCnt = following.length


    // Vemos quienes nos siguen y a quienes no seguimos
    const notFollowingYou = following.filter(item => {
        return !followers.find(f => f.username === item.username)
    })
    // Vemos a quienes no seguimos
    const notFollowingThem = followers.filter(item => {
        return !following.find(f => f.username === item.username)
    })



    // Exportando la data
    // console.log(`followersCnt: ${followerCnt}`)
    // console.log(`followingCnt: ${followingCnt}`)
    // console.log(`followers: ${followers}`)
    // console.log(`following: ${following}`)
    // console.log(`notFollowingYou: ${notFollowingYou}`)
    // console.log(`notFollowingThem: ${notFollowingThem}`)
    // console.log({
    //     "nombre": "cesar",
    //     "apellido": "delrio",
    //     "prubea": "de json"
    // })


    // Cerramos el navegador
    await browser.close()


    // Devolvemos toda la data extraida
    return {
        followerCnt,
        followingCnt,
        notFollowingYou,
        notFollowingThem,
        followers,
        following
    }
}



// Esta es la funcion que uso para poder hacer un scrollDown en el dialgo de los followers
async function scrollDown(selector, page) {

    // Aqui evalua la pagina
    await page.evaluate(async selector => {
        const section = document.querySelector(selector);

        // Hacemos una promesa
        await new Promise((resolve, reject) => {
            // Hacemos las variables de distancia y altura total
            let totalHeight = 0;
            let distance = 100;

            // Hacemos un timer de intervalo
            const timer = setInterval(() => {
                // Sacamos la scrollHeight de la section a la que entramos 
                var scrollHeight = section.scrollHeight;

                // Scrolleamos lo mas que se pueda
                section.scrollTop = 100000000;

                // Se aumenta la variable de totalHeight
                totalHeight += distance;

                // Se hace un condicional para cuando ya no haya mas que scrollear se pare, si la totlaHeight es mayor o igual a la scrollHeight
                if (totalHeight >= scrollHeight) {
                    // Cerramos el timer y resolvemos la promesa
                    clearInterval(timer);
                    resolve();
                }

                // Tiene que ser de un intervalo de 500 ms para que alcance a cargar los demas de la lista y aumente el scrollHeight
            }, 500);
        });
    }, selector);
}

// script('darpauherrera')

module.exports = {script}

