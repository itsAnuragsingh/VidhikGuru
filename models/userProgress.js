import { connectToDatabase } from "@/lib/mongodb"

export async function getUserProgress(userId) {
  try {
    const { client, db } = await connectToDatabase()
    const collection = db.collection('userProgress')
    
    let userProgress = await collection.findOne({ userId })
    
    if (!userProgress) {
      // Create new user progress
      const newProgress = {
        userId,
        readArticles: [],
        totalTimeSpent: 0,
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await collection.insertOne(newProgress)
      userProgress = newProgress
    }
    
    // Calculate progress percentage
    const totalArticles = await getTotalArticlesCount(db)
    const progressPercentage = totalArticles > 0 ? 
      Math.round((userProgress.readArticles.length / totalArticles) * 100) : 0
    
    return {
      totalArticlesRead: userProgress.readArticles.length,
      totalTimeSpent: userProgress.totalTimeSpent,
      progressPercentage,
      totalArticlesInDatabase: totalArticles, // Added for debugging
      readArticles: userProgress.readArticles,
      lastActiveAt: userProgress.lastActiveAt,
    }
  } catch (error) {
    console.error('Error getting user progress:', error)
    throw error
  }
}

export async function markArticleAsRead(userId, partNo, articleNo, timeSpent = 0) {
  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('userProgress')
    
    let userProgress = await collection.findOne({ userId })
    
    if (!userProgress) {
      userProgress = {
        userId,
        readArticles: [],
        totalTimeSpent: 0,
        lastActiveAt: new Date(),
        createdAt: new Date()
      }
    }
    
    // Convert partNo and articleNo to strings for consistency
    const partNoStr = String(partNo)
    const articleNoStr = String(articleNo)
    
    // Check if article already read
    const existingArticle = userProgress.readArticles.find(
      article => String(article.partNo) === partNoStr && String(article.articleNo) === articleNoStr
    )
    
    if (!existingArticle) {
      userProgress.readArticles.push({
        partNo: partNoStr,
        articleNo: articleNoStr,
        readAt: new Date(),
        timeSpent
      })
    } else {
      // Update existing
      existingArticle.timeSpent += timeSpent
      existingArticle.readAt = new Date()
    }
    
    userProgress.totalTimeSpent += timeSpent
    userProgress.lastActiveAt = new Date()
    userProgress.updatedAt = new Date()
    
    // Upsert the document
    await collection.replaceOne(
      { userId }, 
      userProgress, 
      { upsert: true }
    )
    
    const totalArticles = await getTotalArticlesCount(db)
    const progressPercentage = totalArticles > 0 ? 
      Math.round((userProgress.readArticles.length / totalArticles) * 100) : 0
    
    return {
      totalArticlesRead: userProgress.readArticles.length,
      totalArticlesInDatabase: totalArticles,
      progressPercentage,
      message: 'Article marked as read'
    }
  } catch (error) {
    console.error('Error marking article as read:', error)
    throw error
  }
}

async function getTotalArticlesCount(db) {
  try {
    console.log('Attempting to count total articles...')
    
    // First, let's check if the collection exists and has data
    const collection = db.collection('constitution_datas')
    const documentCount = await collection.countDocuments()
    console.log(`Found ${documentCount} documents in constitution_datas`)
    
    if (documentCount === 0) {
      console.log('No documents found in constitution_datas collection')
      return 0
    }
    
    // Sample a document to verify structure
    const sampleDoc = await collection.findOne()
    console.log('Sample document keys:', Object.keys(sampleDoc))
    console.log('Sample PartNo:', sampleDoc.PartNo)
    console.log('Sample Articles length:', sampleDoc.Articles?.length)
    
    const pipeline = [
      { $unwind: '$Articles' },
      { $count: 'total' }
    ]
    
    console.log('Running aggregation pipeline...')
    const result = await collection.aggregate(pipeline).toArray()
    console.log('Aggregation result:', result)
    
    const total = result[0]?.total || 0
    console.log(`Total articles counted: ${total}`)
    
    return total || 395 // fallback if no articles found
  } catch (error) {
    console.error('Error getting total articles:', error)
    console.error('Error details:', error.message)
    return 395 // fallback
  }
}

// Debug function to help troubleshoot
export async function debugConstitutionData() {
  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('constitution_datas')
    
    // Get basic info
    const count = await collection.countDocuments()
    const sample = await collection.findOne()
    
    // Get all part numbers
    const parts = await collection.find({}, { projection: { PartNo: 1, Name: 1 } }).toArray()
    
    // Count articles per part
    const articleCounts = await collection.aggregate([
      {
        $project: {
          PartNo: 1,
          Name: 1,
          articleCount: { $size: "$Articles" }
        }
      }
    ]).toArray()
    
    return {
      totalParts: count,
      sampleStructure: sample ? {
        PartNo: sample.PartNo,
        Name: sample.Name,
        ArticlesCount: sample.Articles?.length,
        FirstArticle: sample.Articles?.[0]
      } : null,
      allParts: parts,
      articleCountsByPart: articleCounts
    }
  } catch (error) {
    console.error('Debug error:', error)
    throw error
  }
}