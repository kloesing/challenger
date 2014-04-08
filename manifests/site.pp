exec { "apt-get update":
  command => "/usr/bin/apt-get update",
}

package { "python-requests":
  require => Exec["apt-get update"],
}

package { "vim":
  require => Exec["apt-get update"],
}

