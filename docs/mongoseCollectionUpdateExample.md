
# For wordCollections Model delete items example


```js

deleteMyCollections()
async function deleteMyCollections() {
  const wordCollections = await wordCollections_model.find(
      {
        /*
        * Filter
        * fieldA: value or expression
        */
       mediaLang: 'zh-CN'
      },
      {
        /*
        * Projection
        * _id: 0, // exclude _id
        * fieldA: 1 // include field
        */
      }
    )
    try {
      const newCollections = wordCollections.map(item => item._doc).map(async (item) => {
        const the_wordMissing = item.keywords.find(item => !item.the_word)
        
        if (the_wordMissing) {
          await wordCollections_model.findOneAndDelete(item._id)
        }
        console.log('deleted title: ')
      })
        console.log('Success')
    } catch(err) {
      console.log('err', err)
    }
}


```