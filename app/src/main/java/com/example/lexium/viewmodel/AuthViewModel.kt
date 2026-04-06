package com.example.lexium.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.lexium.data.database.DatabaseProvider
import com.example.lexium.data.model.User
import kotlinx.coroutines.launch

class AuthViewModel(application: Application) : AndroidViewModel(application) {

    private val userDao = DatabaseProvider.getDatabase(application).userDao()

    fun register(email: String, password: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val existingUser = userDao.getUserByEmail(email)
            if (existingUser == null) {
                userDao.insertUser(User(email = email, password = password))
                onResult(true)
            } else {
                onResult(false)
            }
        }
    }

    fun login(email: String, password: String, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val user = userDao.login(email, password)
            onResult(user != null)
        }
    }
}