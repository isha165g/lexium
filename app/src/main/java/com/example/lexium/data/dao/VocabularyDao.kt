package com.example.lexium.data.dao

import androidx.room.*
import com.example.lexium.data.model.Vocabulary
import kotlinx.coroutines.flow.Flow

@Dao
interface VocabularyDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWord(vocab: Vocabulary)

    @Query("SELECT * FROM vocabulary ORDER BY lastReviewed DESC")
    fun getAllWords(): Flow<List<Vocabulary>>

    @Query("SELECT * FROM vocabulary WHERE word = :word LIMIT 1")
    suspend fun getWord(word: String): Vocabulary?

    @Delete
    suspend fun deleteWord(vocab: Vocabulary)
}