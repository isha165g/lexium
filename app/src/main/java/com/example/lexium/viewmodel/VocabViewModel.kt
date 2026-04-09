package com.example.lexium.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.lexium.data.database.DatabaseProvider
import com.example.lexium.data.model.Vocabulary
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn

class VocabViewModel(application: Application) : AndroidViewModel(application) {

    private val vocabDao = DatabaseProvider.getDatabase(application).vocabularyDao()

    val allWords = vocabDao.getAllWords()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun saveWord(word: String, meaning: String) {
        viewModelScope.launch {
            val existing = vocabDao.getWord(word)

            if (existing == null) {
                val vocab = Vocabulary(
                    word = word,
                    meaning = meaning
                )
                vocabDao.insertWord(vocab)
            }
        }
    }

    fun deleteWord(vocab: Vocabulary) {
        viewModelScope.launch {
            vocabDao.deleteWord(vocab)
        }
    }
}