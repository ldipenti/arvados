% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/ArvadosFile.R
\name{ArvadosFile}
\alias{ArvadosFile}
\title{R6 Class Representing a ArvadosFile}
\description{
ArvadosFile class represents a file inside Arvados collection.
}
\examples{

## ------------------------------------------------
## Method `ArvadosFile$new`
## ------------------------------------------------

\dontrun{
myFile   <- ArvadosFile$new("myFile")
}

## ------------------------------------------------
## Method `ArvadosFile$getName`
## ------------------------------------------------

\dontrun{
arvadosFile$getName()
}

## ------------------------------------------------
## Method `ArvadosFile$getFileListing`
## ------------------------------------------------

\dontrun{
arvadosFile$getFileListing()
}

## ------------------------------------------------
## Method `ArvadosFile$getSizeInBytes`
## ------------------------------------------------

\dontrun{
arvadosFile$getSizeInBytes()
}

## ------------------------------------------------
## Method `ArvadosFile$read`
## ------------------------------------------------

\dontrun{
collection <- Collection$new(arv, collectionUUID)
arvadosFile <- collection$get(fileName)
fileContent <- arvadosFile$read("text")
}

## ------------------------------------------------
## Method `ArvadosFile$connection`
## ------------------------------------------------

\dontrun{
collection <- Collection$new(arv, collectionUUID)
arvadosFile <- collection$get(fileName)
arvConnection <- arvadosFile$connection("w")
}

## ------------------------------------------------
## Method `ArvadosFile$flush`
## ------------------------------------------------

\dontrun{
collection <- Collection$new(arv, collectionUUID)
arvadosFile <- collection$get(fileName)
myFile$write("This is new file content")
arvadosFile$flush()
}

## ------------------------------------------------
## Method `ArvadosFile$write`
## ------------------------------------------------

\dontrun{
collection <- Collection$new(arv, collectionUUID)
arvadosFile <- collection$get(fileName)
myFile$write("This is new file content")
}

## ------------------------------------------------
## Method `ArvadosFile$move`
## ------------------------------------------------

\dontrun{
arvadosFile$move(newPath)
}

## ------------------------------------------------
## Method `ArvadosFile$copy`
## ------------------------------------------------

\dontrun{
arvadosFile$copy("NewName.format")
}
}
\section{Methods}{
\subsection{Public methods}{
\itemize{
\item \href{#method-ArvadosFile-new}{\code{ArvadosFile$new()}}
\item \href{#method-ArvadosFile-getName}{\code{ArvadosFile$getName()}}
\item \href{#method-ArvadosFile-getFileListing}{\code{ArvadosFile$getFileListing()}}
\item \href{#method-ArvadosFile-getSizeInBytes}{\code{ArvadosFile$getSizeInBytes()}}
\item \href{#method-ArvadosFile-get}{\code{ArvadosFile$get()}}
\item \href{#method-ArvadosFile-getFirst}{\code{ArvadosFile$getFirst()}}
\item \href{#method-ArvadosFile-getCollection}{\code{ArvadosFile$getCollection()}}
\item \href{#method-ArvadosFile-setCollection}{\code{ArvadosFile$setCollection()}}
\item \href{#method-ArvadosFile-getRelativePath}{\code{ArvadosFile$getRelativePath()}}
\item \href{#method-ArvadosFile-getParent}{\code{ArvadosFile$getParent()}}
\item \href{#method-ArvadosFile-setParent}{\code{ArvadosFile$setParent()}}
\item \href{#method-ArvadosFile-read}{\code{ArvadosFile$read()}}
\item \href{#method-ArvadosFile-connection}{\code{ArvadosFile$connection()}}
\item \href{#method-ArvadosFile-flush}{\code{ArvadosFile$flush()}}
\item \href{#method-ArvadosFile-write}{\code{ArvadosFile$write()}}
\item \href{#method-ArvadosFile-move}{\code{ArvadosFile$move()}}
\item \href{#method-ArvadosFile-copy}{\code{ArvadosFile$copy()}}
\item \href{#method-ArvadosFile-duplicate}{\code{ArvadosFile$duplicate()}}
}
}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-new"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-new}{}}}
\subsection{Method \code{new()}}{
Initialize new enviroment.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$new(name)}\if{html}{\out{</div>}}
}

\subsection{Arguments}{
\if{html}{\out{<div class="arguments">}}
\describe{
\item{\code{name}}{Name of the new enviroment.}
}
\if{html}{\out{</div>}}
}
\subsection{Returns}{
A new `ArvadosFile` object.
}
\subsection{Examples}{
\if{html}{\out{<div class="r example copy">}}
\preformatted{\dontrun{
myFile   <- ArvadosFile$new("myFile")
}
}
\if{html}{\out{</div>}}

}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-getName"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-getName}{}}}
\subsection{Method \code{getName()}}{
Returns name of the file.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$getName()}\if{html}{\out{</div>}}
}

\subsection{Examples}{
\if{html}{\out{<div class="r example copy">}}
\preformatted{\dontrun{
arvadosFile$getName()
}
}
\if{html}{\out{</div>}}

}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-getFileListing"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-getFileListing}{}}}
\subsection{Method \code{getFileListing()}}{
Returns collections file content as character vector.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$getFileListing(fullpath = TRUE)}\if{html}{\out{</div>}}
}

\subsection{Arguments}{
\if{html}{\out{<div class="arguments">}}
\describe{
\item{\code{fullPath}}{Checking if TRUE.}
}
\if{html}{\out{</div>}}
}
\subsection{Examples}{
\if{html}{\out{<div class="r example copy">}}
\preformatted{\dontrun{
arvadosFile$getFileListing()
}
}
\if{html}{\out{</div>}}

}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-getSizeInBytes"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-getSizeInBytes}{}}}
\subsection{Method \code{getSizeInBytes()}}{
Returns collections content size in bytes.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$getSizeInBytes()}\if{html}{\out{</div>}}
}

\subsection{Examples}{
\if{html}{\out{<div class="r example copy">}}
\preformatted{\dontrun{
arvadosFile$getSizeInBytes()
}
}
\if{html}{\out{</div>}}

}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-get"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-get}{}}}
\subsection{Method \code{get()}}{
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$get(fileLikeObjectName)}\if{html}{\out{</div>}}
}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-getFirst"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-getFirst}{}}}
\subsection{Method \code{getFirst()}}{
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$getFirst()}\if{html}{\out{</div>}}
}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-getCollection"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-getCollection}{}}}
\subsection{Method \code{getCollection()}}{
Returns collection UUID.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$getCollection()}\if{html}{\out{</div>}}
}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-setCollection"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-setCollection}{}}}
\subsection{Method \code{setCollection()}}{
Sets new collection.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$setCollection(collection, setRecursively = TRUE)}\if{html}{\out{</div>}}
}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-getRelativePath"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-getRelativePath}{}}}
\subsection{Method \code{getRelativePath()}}{
Returns file path relative to the root.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$getRelativePath()}\if{html}{\out{</div>}}
}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-getParent"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-getParent}{}}}
\subsection{Method \code{getParent()}}{
Returns project UUID.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$getParent()}\if{html}{\out{</div>}}
}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-setParent"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-setParent}{}}}
\subsection{Method \code{setParent()}}{
Sets project collection.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$setParent(newParent)}\if{html}{\out{</div>}}
}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-read"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-read}{}}}
\subsection{Method \code{read()}}{
Read file content.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$read(contentType = "raw", offset = 0, length = 0)}\if{html}{\out{</div>}}
}

\subsection{Arguments}{
\if{html}{\out{<div class="arguments">}}
\describe{
\item{\code{contentType}}{Type of content. Possible is "text", "raw".}

\item{\code{offset}}{Describes the location of a piece of data compared to another location}

\item{\code{length}}{Length of content}
}
\if{html}{\out{</div>}}
}
\subsection{Examples}{
\if{html}{\out{<div class="r example copy">}}
\preformatted{\dontrun{
collection <- Collection$new(arv, collectionUUID)
arvadosFile <- collection$get(fileName)
fileContent <- arvadosFile$read("text")
}
}
\if{html}{\out{</div>}}

}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-connection"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-connection}{}}}
\subsection{Method \code{connection()}}{
Get connection opened in "read" or "write" mode.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$connection(rw)}\if{html}{\out{</div>}}
}

\subsection{Arguments}{
\if{html}{\out{<div class="arguments">}}
\describe{
\item{\code{rw}}{Type of connection.}
}
\if{html}{\out{</div>}}
}
\subsection{Examples}{
\if{html}{\out{<div class="r example copy">}}
\preformatted{\dontrun{
collection <- Collection$new(arv, collectionUUID)
arvadosFile <- collection$get(fileName)
arvConnection <- arvadosFile$connection("w")
}
}
\if{html}{\out{</div>}}

}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-flush"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-flush}{}}}
\subsection{Method \code{flush()}}{
Write connections content to a file or override current content of the file.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$flush()}\if{html}{\out{</div>}}
}

\subsection{Examples}{
\if{html}{\out{<div class="r example copy">}}
\preformatted{\dontrun{
collection <- Collection$new(arv, collectionUUID)
arvadosFile <- collection$get(fileName)
myFile$write("This is new file content")
arvadosFile$flush()
}
}
\if{html}{\out{</div>}}

}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-write"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-write}{}}}
\subsection{Method \code{write()}}{
Write to file or override current content of the file.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$write(content, contentType = "text/html")}\if{html}{\out{</div>}}
}

\subsection{Arguments}{
\if{html}{\out{<div class="arguments">}}
\describe{
\item{\code{content}}{File to write.}

\item{\code{contentType}}{Type of content. Possible is "text", "raw".}
}
\if{html}{\out{</div>}}
}
\subsection{Examples}{
\if{html}{\out{<div class="r example copy">}}
\preformatted{\dontrun{
collection <- Collection$new(arv, collectionUUID)
arvadosFile <- collection$get(fileName)
myFile$write("This is new file content")
}
}
\if{html}{\out{</div>}}

}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-move"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-move}{}}}
\subsection{Method \code{move()}}{
Moves file to a new location inside collection.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$move(destination)}\if{html}{\out{</div>}}
}

\subsection{Arguments}{
\if{html}{\out{<div class="arguments">}}
\describe{
\item{\code{destination}}{Path to new folder.}
}
\if{html}{\out{</div>}}
}
\subsection{Examples}{
\if{html}{\out{<div class="r example copy">}}
\preformatted{\dontrun{
arvadosFile$move(newPath)
}
}
\if{html}{\out{</div>}}

}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-copy"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-copy}{}}}
\subsection{Method \code{copy()}}{
Copies file to a new location inside collection.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$copy(destination)}\if{html}{\out{</div>}}
}

\subsection{Arguments}{
\if{html}{\out{<div class="arguments">}}
\describe{
\item{\code{destination}}{Path to new folder.}
}
\if{html}{\out{</div>}}
}
\subsection{Examples}{
\if{html}{\out{<div class="r example copy">}}
\preformatted{\dontrun{
arvadosFile$copy("NewName.format")
}
}
\if{html}{\out{</div>}}

}

}
\if{html}{\out{<hr>}}
\if{html}{\out{<a id="method-ArvadosFile-duplicate"></a>}}
\if{latex}{\out{\hypertarget{method-ArvadosFile-duplicate}{}}}
\subsection{Method \code{duplicate()}}{
Duplicate file and gives it a new name.
\subsection{Usage}{
\if{html}{\out{<div class="r">}}\preformatted{ArvadosFile$duplicate(newName = NULL)}\if{html}{\out{</div>}}
}

\subsection{Arguments}{
\if{html}{\out{<div class="arguments">}}
\describe{
\item{\code{newName}}{New name for duplicated file.}
}
\if{html}{\out{</div>}}
}
}
}
