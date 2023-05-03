const express = require('express');
const postsRouter = express.Router();

postsRouter.use((req, res, next) => {
    console.log('Product req being made')
    next();
})

postsRouter.get('/health', async (req, res, next) => {
    res.send({message: "All is well."});
    next();
  });

// postsRouter.get('/', async (req, res, next) => {

//     try {
//         const catagories = await getAllCategorys()

//         res.send(
//             catagories
//         )
//     } catch (error) {
//         next(error);
//     }
// })

// postsRouter.get('/:categoryName', async (req, res, next) => {
//         const { categoryName } = req.params

//         console.log(categoryName)

//         try {
//             const category = await getCategoryByName(categoryName)

//             res.send(category)
//         } catch(error) {
//             next(error);
//         }
// })

// postsRouter.get('/products/:categoryId', async (req, res, next) => {
//     const { categoryId } = req.params;

//     try {
//         const products = await getAllProductsWithCategoryId(categoryId);
//         res.send(products);
//     } catch (error) {
//         next(error);
//     }
// });

// postsRouter.get('/products', async (req, res, next) => {
//     try {
//         const products = await getAllProducts();
//         console.log(products)
//         res.send(products);
//     } catch (error) {
//         next(error);
//     }
// });


// postsRouter.post('/', async (req, res, next) => {
//     const {
//         name, 
//         photos } = req.body

//     try {
//             console.log('FIND', photos)


//             const category = await createCategory({ 
//                 name, 
//                 photos })

//             console.log('FIND', photos)

//             res.send(category)
        
//     } catch (error) {
//         next(error)
//     }
// })

// postsRouter.post('/:categoryId/products', async (req, res, next) => {
//     const { categoryId } = req.params;
//     const { 
//     name,
//     description,
//     price,
//     photos,
//     quantity } = req.body;

//     try {
//         const productToCategory = await createProduct({ 
//             categoryId,
//             name,
//             description,
//             price,
//             photos,
//             quantity })

//             console.log(quantity)

//         res.send(productToCategory)
//     } catch ({name, message}) {
//         next({ name, message})
//     }
// })

// postsRouter.get('/:prodId', async (req, res, next) => {
//     try {
//         const product = req.params.prodId

//         const singleProduct = await getProductById(product)

//         if(singleProduct) {
//             res.send(singleProduct);
//         } else {
//             res.send({name:"No id", message:"Nothing to display"})
//         }

//     } catch (error) {
//         next({error})
//     }
// })

// postsRouter.get('/:categoryName', async (req, res, next) => {
//     try {
//         const { categoryName } = req.params

//         console.log(categoryName)

//         const singleCategory = await getCategoryByName(categoryName)

//         console.log(singleCategory)

//         if(singleCategory) {
//             res.send(singleCategory);
//         } else {
//             res.send({name:"No name", message:"Nothing to display"})
//         }

//     } catch (error) {
//         next({error})
//     }
// })

// postsRouter.delete("/product/:id", async (req, res, next) => {
//     try {
//         const productId = req.params.id;
//         console.log(productId)
//         const deletedProduct = await deleteProduct(productId);
//         if(!deletedProduct) {
//             return res.send("Product not found");
//         }

//         return res.send(deletedProduct)
//     } catch (e) {
//         next({e})
//     }
// })

// postsRouter.delete("/:id", async (req, res, next) => {
//     try {
//         const categoryId = req.params.id;
//         console.log(categoryId)
//         const deletedProduct = await deleteCategory(categoryId);
//         if(!deletedProduct) {
//             return res.send("Product not found");
//         }

//         return res.send(deletedProduct)
//     } catch (e) {
//         next({e})
//     }
// })

module.exports = postsRouter