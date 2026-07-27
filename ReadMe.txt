

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew tap mongodb/brew

brew install mongodb-community@8.0

brew services start mongodb-community

brew services list
